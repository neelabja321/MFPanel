import api from './api'
import {
  cacheRoleAccessMatrix,
  getCachedRoleAccessMatrix,
  validateAccessMatrix,
} from '@/lib/accessMatrix'

function unwrapRoles(body) {
  return (
    (Array.isArray(body) && body) ||
    (Array.isArray(body?.data) && body.data) ||
    (Array.isArray(body?.data?.data) && body.data.data) ||
    (Array.isArray(body?.roles) && body.roles) ||
    []
  )
}

function extractRoleId(payload) {
  const candidates = [
    payload?.roleId,
    payload?.id,
    payload?.data?.roleId,
    payload?.data?.id,
    payload?.role?.roleId,
    payload?.data?.role?.roleId,
  ]
  return candidates.find((value) => value != null && String(value).trim() !== '') ?? null
}

async function resolveCreatedRoleId(payload, roleName) {
  const responseId = extractRoleId(payload)
  if (responseId != null) return responseId

  // Some create responses only return a success message. Resolve the new role
  // by its exact name so its accepted matrix can still be cached by role ID.
  try {
    const response = await api.get('roles')
    const matches = unwrapRoles(response.data)
      .filter((role) => role?.role === roleName)
      .sort((a, b) => Number(b.roleId ?? b.id ?? 0) - Number(a.roleId ?? a.id ?? 0))
    return matches[0]?.roleId ?? matches[0]?.id ?? null
  } catch {
    return null
  }
}

export const roleService = {
  async getAll() {
    const response = await api.get('roles')
    return unwrapRoles(response.data)
  },

  async getById(id) {
    const response = await api.get(`roles/${id}`)
    return response.data?.data ?? response.data
  },

  async create(data) {
    const response = await api.post('roles', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`roles/${id}`, data)
    return response.data
  },

  async createWithAccess({ role, status, access }) {
    const payload = { role, status: Number(status), access }
    const response = await api.post('access-matrix/role', payload)
    const roleId = await resolveCreatedRoleId(response.data, role)
    if (roleId != null) cacheRoleAccessMatrix(roleId, access)
    return response.data
  },

  async getAccessMatrix(roleId) {
    try {
      const response = await api.get(`access-matrix/role/${roleId}`)
      const payload = response.data?.data ?? response.data
      const access = validateAccessMatrix(payload)

      if (!access) {
        const cached = getCachedRoleAccessMatrix(roleId)
        if (cached) {
          return {
            access: cached.access,
            _matrixSource: 'local-cache',
            _cachedAt: cached.savedAt,
          }
        }
        const error = new Error('The server returned an invalid access matrix response.')
        error.isInvalidMatrixResponse = true
        throw error
      }

      cacheRoleAccessMatrix(roleId, access)
      return { ...payload, access, _matrixSource: 'api' }
    } catch (error) {
      // Authentication/authorization/not-found failures must never be hidden by
      // cached data. A network/5xx failure may use a previously API-accepted
      // baseline so view/edit remain usable without inventing permissions.
      const status = error.response?.status
      const mayUseCache = !status || status >= 500 || error.isInvalidMatrixResponse
      const cached = mayUseCache ? getCachedRoleAccessMatrix(roleId) : null
      if (!cached) throw error

      return {
        access: cached.access,
        _matrixSource: 'local-cache',
        _cachedAt: cached.savedAt,
        _apiError: error.response?.data?.message || error.message,
      }
    }
  },

  async updateAccessMatrix(roleId, access) {
    const response = await api.put(`access-matrix/role/${roleId}`, { access })
    cacheRoleAccessMatrix(roleId, access)
    return response.data
  },
}
