import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { exportToExcel } from '@/lib/exportUtils'
import { Users } from 'lucide-react'
import { customerService } from '@/services/customerService'
import { groupService } from '@/services/groupService'
import DataTableLayout from '@/components/shared/DataTableLayout'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import ActionButtons from '@/components/shared/ActionButtons'
import { formatDate } from '@/lib/utils'

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const queryClient = useQueryClient()

  const { data: groups = [] } = useQuery({
    queryKey: ['groups-options'],
    queryFn: () => groupService.getAllOptions(),
  })

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', search, groupFilter, statusFilter],
    queryFn: () => customerService.getAll({ search, groupId: groupFilter, status: statusFilter }),
  })

  const deleteMutation = useMutation({
    mutationFn: customerService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  })

  const columns = [
    { key: 'id', label: 'ID', width: 90 },
    {
      key: 'name',
      label: 'Customer',
      render: (v, row) => (
        <div>
          <p className="font-medium text-foreground">{v}</p>
          <p className="text-xs text-muted-foreground">{row.phone}</p>
        </div>
      ),
    },
    {
      key: 'groupId',
      label: 'Group',
      render: (v) => groups.find((g) => g.value === v)?.label || v || '-',
    },
    { key: 'idProof', label: 'ID Proof' },
    { key: 'joinDate', label: 'Joined', render: (v) => formatDate(v) },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    {
      key: 'actions',
      label: '',
      width: 100,
      render: (_, row) => (
        <ActionButtons
          viewTo={`/customers/${row.id}`}
          editTo={`/customers/${row.id}/edit`}
          onDelete={() => deleteMutation.mutateAsync(row.id)}
        />
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Customers"
        description={`${customers.length} member${customers.length !== 1 ? 's' : ''} enrolled`}
        action={{ label: 'Add Customer', to: '/customers/create' }}
        onExport={() => exportToExcel(customers, columns, 'customers.xlsx')}
        onPrint={() => window.print()}
      />
      <DataTableLayout
        columns={columns}
        data={customers}
        loading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, phone, ID..."
        emptyIcon={Users}
        emptyTitle="No customers found"
        emptyDescription="Add your first customer to get started"
        filterSlot={
          <div className="flex gap-2 flex-wrap">
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="text-sm rounded-xl border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Groups</option>
              {groups.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm rounded-xl border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="defaulted">Defaulted</option>
            </select>
          </div>
        }
      />
    </div>
  )
}
