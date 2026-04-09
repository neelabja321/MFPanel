import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { exportToExcel } from '@/lib/exportUtils'
import { UserCog } from 'lucide-react'
import { userService } from '@/services/userService'
import DataTableLayout from '@/components/shared/DataTableLayout'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import ActionButtons from '@/components/shared/ActionButtons'
import { formatDate } from '@/lib/utils'

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const queryClient = useQueryClient()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', search, roleFilter, statusFilter],
    queryFn: () => userService.getAll({ search, role: roleFilter, status: statusFilter }),
  })

  const deleteMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  const columns = [
    { key: 'id', label: 'User ID', width: 100 },
    {
      key: 'name',
      label: 'Staff Member',
      render: (v, row) => (
        <div>
          <p className="font-medium text-foreground">{v}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    { key: 'role', label: 'Role', render: (v) => <span className="capitalize">{v}</span> },
    { key: 'createdAt', label: 'Joined', render: (v) => formatDate(v) },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    {
      key: 'actions',
      label: '',
      width: 80,
      render: (_, row) => (
        <ActionButtons
          editTo={`/users/${row.id}/edit`}
          onDelete={() => deleteMutation.mutateAsync(row.id)}
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
        onPrint={() => window.print()}
      />
      <DataTableLayout
        columns={columns}
        data={users}
        loading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email or ID..."
        emptyIcon={UserCog}
        emptyTitle="No users found"
        emptyDescription="Get started by adding a staff member"
        filterSlot={
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-sm rounded-xl border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm rounded-xl border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        }
      />
    </div>
  )
}
