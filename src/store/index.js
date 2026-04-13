import { create } from 'zustand'

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
  
  setAuth: (user, token) => {
    localStorage.setItem('authToken', token)
    localStorage.setItem('authUser', JSON.stringify(user))
    set({ isAuthenticated: true, user })
  },
  
  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    set({ isAuthenticated: false, user: null })
  },
}))
