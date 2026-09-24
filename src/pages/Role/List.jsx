import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShieldAlert, Shield } from 'lucide-react'
import { roleService } from '@/services/roleService'
import DataTableLayout from '@/components/shared/DataTableLayout'
import PageHeader from '@/components/shared/PageHeader'
import ActionButtons from '@/components/shared/ActionButtons'
import { formatDate } from '@/lib/utils'

export default function RolesList() {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  // Assuming roleService.getAll() returns an array of roles.
  // Fallback to empty array to handle any differences in response shape.
  const { data: rawRoles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: roleService.getAll,
  })

  // Ensure it's an array for frontend
  const rolesData = Array.isArray(rawRoles) ? rawRoles : rawRoles?.data || []

  const roles = useMemo(() => {
    let result = rolesData
    if (search) {
      const lower = search.toLowerCase()
      result = result.filter(r => r.role?.toLowerCase().includes(lower))
    }
    // Sort by roleId descending (newest roles have the highest IDs).
    // createdDtm is unreliable here — some records carry placeholder dates.
    return [...result].sort((a, b) => (b.roleId || 0) - (a.roleId || 0))
  }, [rolesData, search])

  // Optional: add a mock delete if the API doesn't exist, here. 
  // However we are not provided delete API in the task, so we might just not have a delete button.

  const columns = [
    { key: 'roleId', label: 'ID', width: 60 },
    {
      key: 'role',
      label: 'Role Name',
      render: (v) => <span className="font-medium text-foreground">{v}</span>,
    },
    {
      key: 'level',
      label: 'Level',
      width: 80,
      render: (v) => (
        <span className="inline-flex items-center justify-center min-w-[1.5rem] px-2 py-0.5 text-xs font-semibold rounded-md bg-muted text-muted-foreground">
          {v ?? '-'}
        </span>
      ),
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (v) => (
        <span
          className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${
            v === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {v === 1 ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    { key: 'createdDtm', label: 'Created', render: (v) => formatDate(v) },
    {
      key: 'actions',
      label: '',
      width: 60,
      render: (_, row) => (
        <ActionButtons editTo={`/roles/${row.roleId}/edit`} onDelete={undefined} />
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Role Management"
        description="Manage system roles and their access matrices"
        action={{ label: 'Create Role', to: '/roles/create' }}
      />
      <DataTableLayout
        columns={columns}
        data={roles}
        loading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search role name..."
        emptyIcon={Shield}
        emptyTitle="No roles found"
        emptyDescription="Get started by creating a new role with custom access matrix"
      />
    </div>
  )
}
