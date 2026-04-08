import { customersData } from '@/mock-data/customers'
import { delay, generateId } from '@/lib/utils'

let _customers = [...customersData]

export const customerService = {
  async getAll(filters = {}) {
    await delay()
    let result = [..._customers]
    if (filters.search) {
      const s = filters.search.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.phone.includes(s) ||
          c.id.toLowerCase().includes(s)
      )
    }
    if (filters.groupId) result = result.filter((c) => c.groupId === filters.groupId)
    if (filters.status) result = result.filter((c) => c.status === filters.status)
    return result
  },

  async getById(id) {
    await delay()
    return _customers.find((c) => c.id === id) || null
  },

  async create(data) {
    await delay()
    const newCustomer = { ...data, id: 'CUST' + generateId(), joinDate: new Date().toISOString().split('T')[0] }
    _customers.push(newCustomer)
    return newCustomer
  },

  async update(id, data) {
    await delay()
    const idx = _customers.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Customer not found')
    _customers[idx] = { ..._customers[idx], ...data }
    return _customers[idx]
  },

  async delete(id) {
    await delay()
    const idx = _customers.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Customer not found')
    _customers.splice(idx, 1)
    return true
  },

  async getByGroup(groupId) {
    await delay(300)
    return _customers.filter((c) => c.groupId === groupId)
  },
}
