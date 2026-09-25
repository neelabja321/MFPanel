import { validateAccessMatrix } from './accessMatrix.js'

export const MODULES = Object.freeze({
  ADMINISTRATOR: 'Administrator',
  MASTER: 'Master',
  CUSTOMER: 'Customer',
  GROUP: 'Group',
  DEPOSIT: 'Deposit',
  LOAN: 'Loan',
})

export const PERMISSIONS = Object.freeze({
  LIST: 'list',
  CREATE: 'create_records',
  EDIT: 'edit_records',
  DELETE: 'delete_records',
})

export const MODULE_HOME_ROUTES = [
  { module: MODULES.MASTER, permission: PERMISSIONS.LIST, path: '/' },
  { module: MODULES.CUSTOMER, permission: PERMISSIONS.LIST, path: '/customers' },
  { module: MODULES.GROUP, permission: PERMISSIONS.LIST, path: '/groups' },
  { module: MODULES.DEPOSIT, permission: PERMISSIONS.LIST, path: '/savings' },
  { module: MODULES.LOAN, permission: PERMISSIONS.LIST, path: '/loans' },
  { module: MODULES.ADMINISTRATOR, permission: PERMISSIONS.LIST, path: '/users' },
]

function normalizeName(value) {
  return String(value ?? '').trim().toLowerCase()
}

export function canAccess(permissions, module, permission = PERMISSIONS.LIST) {
  if (Array.isArray(module)) {
    return module.every((requiredModule) => canAccess(permissions, requiredModule, permission))
  }
  const rows = Array.isArray(permissions) ? permissions : validateAccessMatrix(permissions)
  if (!rows) return false
  const row = rows.find((item) => normalizeName(item.module) === normalizeName(module))
  return row?.total_access === 1 && row?.[permission] === 1
}

export function getFirstAllowedPath(permissions) {
  return MODULE_HOME_ROUTES.find(({ module, permission }) =>
    canAccess(permissions, module, permission))?.path ?? '/access-denied'
}

export function getUserRoleId(user) {
  const value =
    user?.roleId ??
    user?.role_id ??
    user?.role?.roleId ??
    user?.role?.role_id ??
    user?.role?.id
  const roleId = Number(value)
  return Number.isFinite(roleId) && roleId > 0 ? roleId : null
}

export function getUserId(user) {
  const value = user?.userId ?? user?.user_id ?? user?.id
  return value == null || String(value).trim() === '' ? null : value
}

export function getUserRoleName(user) {
  const value = typeof user?.role === 'string' ? user.role : user?.role?.role
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export function toRoleOptions(roles) {
  if (!Array.isArray(roles)) return []
  const seen = new Set()
  return roles.flatMap((role) => {
    const id = Number(role?.roleId ?? role?.id)
    const label = String(role?.role ?? '').trim()
    if (!Number.isFinite(id) || id <= 0 || !label || seen.has(id)) return []
    seen.add(id)
    return [{ id, label, status: Number(role.status) }]
  })
}
