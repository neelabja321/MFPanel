import api from './api'

export const userService = {
  async getAll() {
    // API returns { status: "success", data: [...] }
    const response = await api.get('users')
    return response.data.data
  },

  async getById(id) {
    // For when you view/edit a user specifically. Assuming restful /users/{id}
    const response = await api.get(`users/${id}`)
    // Fallback if backend does not wrap in { data: ... } structure for singles
    return response.data.data || response.data
  },

  async create(data) {
    // Payload should match API contract
    const response = await api.post('auth/register', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`users/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`users/${id}`)
    return response.data
  },
}
