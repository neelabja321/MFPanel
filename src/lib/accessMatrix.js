// Shared helpers for role access matrices.

export const MODULE_GATE_FIELD = 'total_access'

export const PERMISSION_FIELDS = [
  { key: 'total_access', label: 'Total Access' },
  { key: 'list', label: 'List' },
  { key: 'create_records', label: 'Create' },
  { key: 'edit_records', label: 'Edit' },
  { key: 'delete_records', label: 'Delete' },
]

export const SUB_PERMISSION_KEYS = PERMISSION_FIELDS
  .filter((field) => field.key !== MODULE_GATE_FIELD)
  .map((field) => field.key)

// These are the modules explicitly defined by the create-role API contract.
export const DEFAULT_MODULES = [
  'Administrator',
  'Master',
  'Customer',
  'Group',
  'Deposit',
  'Loan',
]

const MATRIX_CACHE_KEY = 'roleAccessMatrices:v1'
const ALLOWED_FLAG_VALUES = new Set([0, 1, '0', '1', false, true])

function toFlag(value) {
  return value === true || value === 1 || value === '1' ? 1 : 0
}

/** Normalize a user-authored row into the exact API request shape. */
export function normalizeModule(row) {
  const name = typeof row === 'string' ? row : row?.module ?? row?.module_name ?? ''
  const source = typeof row === 'string' ? {} : row ?? {}
  const totalAccess = toFlag(source.total_access)

  // `total_access` is the authoritative module gate.
  return {
    module: name,
    total_access: totalAccess,
    list: totalAccess ? toFlag(source.list) : 0,
    create_records: totalAccess ? toFlag(source.create_records) : 0,
    edit_records: totalAccess ? toFlag(source.edit_records) : 0,
    delete_records: totalAccess ? toFlag(source.delete_records) : 0,
  }
}

export function emptyMatrix(modules = DEFAULT_MODULES) {
  return modules.map((module) => normalizeModule(module))
}

function parseAccessCandidate(candidate) {
  if (Array.isArray(candidate)) return candidate
  if (typeof candidate !== 'string' || !candidate.trim()) return null

  try {
    const parsed = JSON.parse(candidate)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** Extract an access array from supported API envelope variants. */
export function extractAccess(payload) {
  if (payload == null) return null
  const candidates = [
    payload,
    payload.access,
    payload.data,
    payload.data?.access,
    payload.role?.access,
    payload.default_structure,
    payload.modules,
  ]

  for (const candidate of candidates) {
    const parsed = parseAccessCandidate(candidate)
    if (parsed !== null) return parsed
  }
  return null
}

/**
 * Validate an authoritative matrix before it can become an update baseline.
 * Invalid/missing fields fail closed instead of being silently converted to 0.
 */
export function validateAccessMatrix(payload) {
  const rows = extractAccess(payload)
  if (!Array.isArray(rows) || rows.length === 0) return null

  const names = new Set()
  const validated = []

  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return null
    const module = String(row.module ?? row.module_name ?? '').trim()
    if (!module || names.has(module)) return null

    for (const { key } of PERMISSION_FIELDS) {
      if (!(key in row) || !ALLOWED_FLAG_VALUES.has(row[key])) return null
    }

    names.add(module)
    validated.push(normalizeModule({ ...row, module }))
  }

  return validated
}

export function extractRole(payload) {
  if (!payload || Array.isArray(payload)) return null
  const candidates = [
    typeof payload.role === 'object' ? payload.role : null,
    typeof payload.data?.role === 'object' ? payload.data.role : null,
    payload.data,
    payload,
  ]

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) continue
    if (typeof candidate.role === 'string' || candidate.roleId != null) return candidate
  }
  return null
}

/**
 * Build a display matrix. Existing roles preserve exactly their authoritative
 * module rows; defaults are used only when creating a brand-new role.
 */
export function buildMatrix(saved, modules) {
  const savedRows = validateAccessMatrix(saved)
  if (savedRows) return savedRows

  const moduleRows = extractAccess(modules)
  if (moduleRows?.length) {
    const names = moduleRows
      .map((module) => (typeof module === 'string' ? module : module?.module ?? module?.module_name))
      .filter(Boolean)
    return emptyMatrix([...new Set(names)])
  }

  return emptyMatrix()
}

export function applyPermissionChange(rows, index, field, checked) {
  return rows.map((row, rowIndex) => {
    if (rowIndex !== index) return row
    const next = { ...row, [field]: checked ? 1 : 0 }

    if (field === MODULE_GATE_FIELD && !checked) {
      SUB_PERMISSION_KEYS.forEach((key) => { next[key] = 0 })
    } else if (field !== MODULE_GATE_FIELD && checked) {
      next[MODULE_GATE_FIELD] = 1
    }
    return next
  })
}

export function setModuleAll(rows, index, granted) {
  return rows.map((row, rowIndex) => {
    if (rowIndex !== index) return row
    const flag = granted ? 1 : 0
    return {
      module: row.module,
      total_access: flag,
      list: flag,
      create_records: flag,
      edit_records: flag,
      delete_records: flag,
    }
  })
}

export function toAccessPayload(rows) {
  return rows.map(normalizeModule)
}

export function countEnabledModules(rows) {
  return rows.filter((row) => row.total_access === 1).length
}

function readMatrixCache() {
  if (typeof localStorage === 'undefined') return {}
  try {
    const parsed = JSON.parse(localStorage.getItem(MATRIX_CACHE_KEY) || '{}')
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

/** Cache only matrices that have already been accepted by the API. */
export function cacheRoleAccessMatrix(roleId, access) {
  const id = String(roleId ?? '').trim()
  const validated = validateAccessMatrix({ access })
  if (!id || !validated || typeof localStorage === 'undefined') return false

  const cache = readMatrixCache()
  cache[id] = { access: validated, savedAt: new Date().toISOString() }

  try {
    localStorage.setItem(MATRIX_CACHE_KEY, JSON.stringify(cache))
    return true
  } catch {
    return false
  }
}

export function clearRoleAccessMatrixCache() {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(MATRIX_CACHE_KEY)
}

export function getCachedRoleAccessMatrix(roleId) {
  const entry = readMatrixCache()[String(roleId ?? '')]
  const access = validateAccessMatrix(entry)
  if (!access) return null
  return { access, savedAt: entry.savedAt ?? null }
}
