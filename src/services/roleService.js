import api from './api'

export const roleService = {
  // --- Role records (RESTful resource: /api/roles) ---

  async getAll() {
    // Roles listing at `GET /api/roles`.
    const response = await api.get('roles')
    const body = response.data
    // Be tolerant of the exact response shape:
    //   [ ... ]                       -> bare array
    //   { data: [ ... ] }             -> wrapped success envelope
    //   { data: { data: [ ... ] } }   -> paginated collection
    const roles =
      (Array.isArray(body) && body) ||
      (Array.isArray(body?.data) && body.data) ||
      (Array.isArray(body?.data?.data) && body.data.data) ||
      (Array.isArray(body?.roles) && body.roles) ||
      []
    return roles
  },

  async getById(id) {
    // `GET /api/roles/{id}` returns { status, data: { roleId, role, level, status, ... } }.
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

  // --- Access matrix (module permissions: /api/access-matrix/*) ---

  async getAllModules() {
    // Returns the default module structure used to render the permissions grid.
    const response = await api.get('access-matrix/modules')
    return response.data.data
  },

  async getAccessMatrix(roleId) {
    // Current per-role permissions: `GET /api/access-matrix/role/{roleId}`.
    const response = await api.get(`access-matrix/role/${roleId}`)
    return response.data?.data ?? response.data
  },

  async updateAccessMatrix(roleId, access) {
    // Persist permissions: `PUT /api/access-matrix/role/{roleId}` with { access: [...] }.
    const response = await api.put(`access-matrix/role/${roleId}`, { access })
    return response.data
  },
}
