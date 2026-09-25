import { create } from 'zustand'
import { clearRoleAccessMatrixCache } from '@/lib/accessMatrix'

export const useUIStore = create((set) => ({
  sidebarOpen: window.innerWidth >= 768,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (val) => set({ sidebarOpen: val }),
  theme: localStorage.getItem('mf-theme') || 'light',
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('mf-theme', newTheme)
    return { theme: newTheme }
  }),
}))

export const useFilterStore = create((set) => ({
  transactions: {
    groupId: '',
    customerId: '',
    dateFrom: '',
    dateTo: '',
    type: '',
  },
  setTransactionFilters: (filters) =>
    set((s) => ({ transactions: { ...s.transactions, ...filters } })),
  resetTransactionFilters: () =>
    set({ transactions: { groupId: '', customerId: '', dateFrom: '', dateTo: '', type: '' } }),
}))

export const useAuthStore = create((set) => ({
  isAuthenticated: !!localStorage.getItem('authToken'),
  user: JSON.parse(localStorage.getItem('authUser') || 'null'),
  roleId: null,
  roleName: null,
  permissions: null,
  permissionStatus: 'idle',
  permissionError: null,

  setPermissionLoading: () => set({ permissionStatus: 'loading', permissionError: null }),
  setPermissions: ({ roleId, roleName, permissions }) => set({
    roleId,
    roleName,
    permissions,
    permissionStatus: 'ready',
    permissionError: null,
  }),
  setPermissionError: (message) => set({
    roleId: null,
    roleName: null,
    permissions: null,
    permissionStatus: 'error',
    permissionError: message,
  }),
  retryPermissions: () => set({ permissionStatus: 'idle', permissionError: null }),
  updateAuthUser: (updates) => set((state) => {
    const user = { ...state.user, ...updates }
    localStorage.setItem('authUser', JSON.stringify(user))
    return {
      user,
      roleId: null,
      roleName: null,
      permissions: null,
      permissionStatus: 'idle',
      permissionError: null,
    }
  }),
  
  setAuth: (user, token) => {
    // Cached permissions belong to the previous authentication context.
    clearRoleAccessMatrixCache()
    localStorage.setItem('authToken', token)
    localStorage.setItem('authUser', JSON.stringify(user))
    set({
      isAuthenticated: true,
      user,
      roleId: null,
      roleName: null,
      permissions: null,
      permissionStatus: 'idle',
      permissionError: null,
    })
  },
  
  logout: () => {
    clearRoleAccessMatrixCache()
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    set({
      isAuthenticated: false,
      user: null,
      roleId: null,
      roleName: null,
      permissions: null,
      permissionStatus: 'idle',
      permissionError: null,
    })
  },
}))
