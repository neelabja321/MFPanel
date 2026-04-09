import { users, setUsers } from '../mock-data/users'

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

export const userService = {
  async getAll({ search = '', role = '', status = '' } = {}) {
    await delay()
    let filtered = [...users]

    if (search) {
      const lowerSearch = search.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(lowerSearch) ||
          u.email.toLowerCase().includes(lowerSearch) ||
          u.id.toLowerCase().includes(lowerSearch)
      )
    }

    if (role) {
      filtered = filtered.filter((u) => u.role === role)
    }

    if (status) {
      filtered = filtered.filter((u) => u.status === status)
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  async getById(id) {
    await delay()
    const user = users.find((u) => u.id === id)
    if (!user) throw new Error('User not found')
    return user
  },

  async create(data) {
    await delay()
    const newUser = {
      id: `U${String(users.length + 1).padStart(3, '0')}`,
      ...data,
      createdAt: new Date().toISOString(),
    }
    setUsers([...users, newUser])
    return newUser
  },

  async update(id, data) {
    await delay()
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) throw new Error('User not found')
    
    const updatedUser = { ...users[index], ...data }
    const newUsers = [...users]
    newUsers[index] = updatedUser
    setUsers(newUsers)
    return updatedUser
  },

  async delete(id) {
    await delay()
    const newUsers = users.filter((u) => u.id !== id)
    setUsers(newUsers)
    return { success: true }
  },
}
