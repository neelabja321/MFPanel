import api from './api'

export const roleService = {
  async getAllModules() {
    const response = await api.get('access-matrix/modules')
    return response.data.data
  },

  async getAll() {
    // There doesn't appear to be a strict GET /access-matrix/role without ID in the request,
    // assuming it returns the list or maybe we fallback.
    const response = await api.get('access-matrix/role')
    return response.data.data
  },

  async getById(id) {
    const response = await api.get(`access-matrix/role/${id}`)
    return response.data.data
  },

  async create(data) {
    const response = await api.post('access-matrix/role', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`access-matrix/role/${id}`, data)
    return response.data
  },
}
