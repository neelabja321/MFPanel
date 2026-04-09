export let users = [
  { id: 'U001', name: 'System Admin', email: 'admin@financeorbit.com', role: 'admin', status: 'active', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'U002', name: 'Branch Manager', email: 'manager@financeorbit.com', role: 'manager', status: 'active', createdAt: '2025-01-15T00:00:00.000Z' },
  { id: 'U003', name: 'Field Agent', email: 'agent@financeorbit.com', role: 'staff', status: 'active', createdAt: '2025-02-01T00:00:00.000Z' },
]

export const setUsers = (newUsers) => {
  users = newUsers
}
