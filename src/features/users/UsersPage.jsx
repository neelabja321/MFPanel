import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { exportToExcel } from '@/lib/exportUtils'
import { UserCog } from 'lucide-react'
import { userService } from '@/services/userService'
import DataTableLayout from '@/components/shared/DataTableLayout'
import PageHeader from '@/components/shared/PageHeader'
import ActionButtons from '@/components/shared/ActionButtons'
import { formatDate } from '@/lib/utils'

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const queryClient = useQueryClient()

  // Fetch all users directly from the API endpoint
  const { data: rawUsers = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  })

  // Client-side filtering and sorting since API returns all
  const users = useMemo(() => {
    let result = rawUsers
    
    if (search) {
      const lower = search.toLowerCase()
      result = result.filter(u => 
        u.name?.toLowerCase().includes(lower) || 
        u.email?.toLowerCase().includes(lower) ||
        String(u.userId).includes(lower) ||
        u.mobile?.includes(lower)
      )
    }
    
    if (roleFilter) {
      result = result.filter(u => String(u.roleId) === roleFilter)
    }
    
    if (statusFilter) {
      result = result.filter(u => String(u.isAdmin) === statusFilter)
    }
    
    // Sort descending by createdDtm
    return result.sort((a, b) => new Date(b.createdDtm) - new Date(a.createdDtm))
  }, [rawUsers, search, roleFilter, statusFilter])

  const deleteMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  // Serverside print handler mapping
  const handlePrint = async () => {
    try {
      const serverData = await userService.getAll()
      
      const printWindow = window.open('', '_blank')
      if (!printWindow) return alert('Please allow popups to print reports.')

      const html = `
        <html>
          <head>
            <title>Systems Users Report</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 20px; color: #111; }
              h1 { font-size: 20px; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; font-size: 13px; }
              th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
              th { background-color: #f4f4f5; font-weight: 600; text-transform: uppercase; font-size: 11px; }
              .capitalize { text-transform: capitalize; }
              @media print {
                @page { margin: 1cm; size: landscape; }
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <h1>Systems Users & Roles Report</h1>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Access</th>
                  <th>Branch</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                ${serverData.map(u => `
                  <tr>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td>${u.mobile || '-'}</td>
                    <td class="capitalize">${u.role?.role || 'Unknown'}</td>
                    <td>${u.isAdmin === 1 ? 'Admin' : u.isAdmin === 2 ? 'Staff' : 'Basic'}</td>
                    <td>${u.branch_id === 0 ? 'Main' : 'Branch ' + u.branch_id}</td>
                    <td>${formatDate(u.createdDtm)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <script>
              window.onload = () => {
                setTimeout(() => {
                   window.print();
                }, 200);
              }
            </script>
          </body>
        </html>
      `
      printWindow.document.write(html)
      printWindow.document.close()
    } catch (err) {
      console.error('Failed to print server data', err)
      alert('Failed to load server data for printing.')
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Staff Member',
      render: (v, row) => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    { key: 'mobile', label: 'Mobile' },
    { 
      key: 'roleId', 
      label: 'Role', 
      render: (v, row) => <span className="capitalize">{row.role?.role || 'Unknown'}</span> 
    },
    { 
      key: 'isAdmin', 
      label: 'Access', 
      render: (v) => {
        if (v === 1) return <span className="text-[11px] px-2 py-1 bg-green-100/80 text-green-700 rounded-full font-bold uppercase tracking-wider">Admin</span>
        if (v === 2) return <span className="text-[11px] px-2 py-1 bg-blue-100/80 text-blue-700 rounded-full font-bold uppercase tracking-wider">Staff</span>
        return <span className="text-[11px] px-2 py-1 bg-slate-100 text-slate-600 rounded-full font-bold uppercase tracking-wider">Basic</span>
      } 
    },
    { key: 'branch_id', label: 'Branch', render: (v) => v === 0 ? 'Main' : `Branch ${v}` },
    { key: 'createdDtm', label: 'Joined', render: (v) => formatDate(v) },
    {
      key: 'actions',
      label: '',
      width: 80,
      render: (_, row) => (
        <ActionButtons
          editTo={`/users/${row.userId}/edit`}
          onDelete={() => deleteMutation.mutateAsync(row.userId)}
        />
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Users & Roles"
        description="Manage system access and staff roles"
        action={{ label: 'Add User', to: '/users/create' }}
        onExport={() => exportToExcel(users, columns, 'users.xlsx')}
        onPrint={handlePrint}
      />
      <DataTableLayout
        columns={columns}
        data={users}
        loading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, email, or mobile..."
        emptyIcon={UserCog}
        emptyTitle="No users found"
        emptyDescription="Get started by adding a staff member"
        filterSlot={
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-sm rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary shadow-sm"
            >
              <option value="">All Roles</option>
              <option value="1">System Administrator</option>
              <option value="2">Manager</option>
              <option value="3">Employee</option>
              <option value="12">Data Entry Operator</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm rounded-xl border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary shadow-sm"
            >
              <option value="">All Access Levels</option>
              <option value="1">Admin (L1)</option>
              <option value="2">Non-Admin (L2)</option>
              <option value="0">Basic Access</option>
            </select>
          </div>
        }
      />
    </div>
  )
}
