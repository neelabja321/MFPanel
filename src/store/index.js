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
  isAuthenticated: false,
  user: null,
  login: (username, password) => {
    // Static validation for now
    if (username === 'admin' && password === 'admin123') {
      set({ isAuthenticated: true, user: { name: 'Admin', role: 'Manager' } })
      return true
    }
    return false
  },
  logout: () => set({ isAuthenticated: false, user: null }),
}))
