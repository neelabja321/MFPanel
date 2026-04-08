import { groupsData } from '@/mock-data/groups'
import { delay, generateId } from '@/lib/utils'

let _groups = [...groupsData]

export const groupService = {
  async getAll(filters = {}) {
    await delay()
    let result = [..._groups]
    if (filters.search) {
      const s = filters.search.toLowerCase()
      result = result.filter(
        (g) => g.name.toLowerCase().includes(s) || g.location.toLowerCase().includes(s)
      )
    }
    if (filters.status) result = result.filter((g) => g.status === filters.status)
    return result
  },

  async getById(id) {
    await delay()
    return _groups.find((g) => g.id === id) || null
  },

  async create(data) {
    await delay()
    const newGroup = { ...data, id: 'GRP' + generateId(), memberCount: 0, totalLoanExposure: 0, totalSavings: 0 }
    _groups.push(newGroup)
    return newGroup
  },

  async update(id, data) {
    await delay()
    const idx = _groups.findIndex((g) => g.id === id)
    if (idx === -1) throw new Error('Group not found')
    _groups[idx] = { ..._groups[idx], ...data }
    return _groups[idx]
  },

  async delete(id) {
    await delay()
    const idx = _groups.findIndex((g) => g.id === id)
    if (idx === -1) throw new Error('Group not found')
    _groups.splice(idx, 1)
    return true
  },

  async getAllOptions() {
    await delay(200)
    return _groups.map((g) => ({ value: g.id, label: g.name }))
  },
}
