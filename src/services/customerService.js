import api from './api'

export const customerService = {
  getCustomers: async (params = {}) => {
    const response = await api.get('customers', { params })
    // Return data depending on standard API response shape
    // Defaulting to response.data
    return response.data
  },

  getCustomerById: async (id) => {
    const response = await api.get(`customers/${id}`)
    return response.data
  },

  createCustomer: async (payload) => {
    const response = await api.post('customers', payload)
    return response.data
  },

  updateCustomer: async (id, payload) => {
    const response = await api.put(`customers/${id}`, payload)
    return response.data
  },

  deleteCustomer: async (id) => {
    const response = await api.delete(`customers/${id}`)
    return response.data
  },
}
