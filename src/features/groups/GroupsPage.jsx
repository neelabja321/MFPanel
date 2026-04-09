import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { exportToExcel } from '@/lib/exportUtils'
import { UsersRound } from 'lucide-react'
import { groupService } from '@/services/groupService'
import DataTableLayout from '@/components/shared/DataTableLayout'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import ActionButtons from '@/components/shared/ActionButtons'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function GroupsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const queryClient = useQueryClient()

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups', search, statusFilter],
    queryFn: () => groupService.getAll({ search, status: statusFilter }),
  })

  const deleteMutation = useMutation({
    mutationFn: groupService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  })

  const columns = [
    { key: 'id', label: 'ID', width: 90 },
    {
      key: 'name',
      label: 'Group',
      render: (v, row) => (
        <div>
          <p className="font-medium text-foreground">{v}</p>
          <p className="text-xs text-muted-foreground">{row.location}</p>
        </div>
      ),
    },
    {
      key: 'leader',
      label: 'Leader',
      render: (v, row) => (
        <div>
          <p className="text-sm text-foreground">{v}</p>
          <p className="text-xs text-muted-foreground">{row.leaderPhone}</p>
        </div>
      ),
    },
    { key: 'memberCount', label: 'Members', render: (v) => <span className="font-semibold">{v}</span> },
    { key: 'totalLoanExposure', label: 'Total Loans', render: (v) => formatCurrency(v) },
    { key: 'totalSavings', label: 'Total Savings', render: (v) => formatCurrency(v) },
    { key: 'formedDate', label: 'Formed', render: (v) => formatDate(v) },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    {
      key: 'actions',
      label: '',
      width: 80,
      render: (_, row) => (
        <ActionButtons
          editTo={`/groups/${row.id}/edit`}
          onDelete={() => deleteMutation.mutateAsync(row.id)}
        />
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Groups"
        description={`${groups.length} self-help group${groups.length !== 1 ? 's' : ''}`}
        action={{ label: 'Add Group', to: '/groups/create' }}
        onExport={() => exportToExcel(groups, columns, 'groups.xlsx')}
        onPrint={() => window.print()}
      />
      <DataTableLayout
        columns={columns}
        data={groups}
        loading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by group name or location..."
        emptyIcon={UsersRound}
        emptyTitle="No groups found"
        emptyDescription="Create your first self-help group"
        filterSlot={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm rounded-xl border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        }
      />
    </div>
  )
}
