import api from './api'
import { clearRoleAccessMatrixCache } from '@/lib/accessMatrix'

export const authService = {
  login: async (email, password) => {
    const response = await api.post('auth/login', { email, password })
    return response.data
  },
  
  logout: () => {
    clearRoleAccessMatrixCache()
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
  }
}
