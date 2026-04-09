import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { exportToExcel } from '@/lib/exportUtils'
import { CreditCard } from 'lucide-react'
import { loanService } from '@/services/loanService'
import { groupService } from '@/services/groupService'
import { customerService } from '@/services/customerService'
import DataTableLayout from '@/components/shared/DataTableLayout'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import ActionButtons from '@/components/shared/ActionButtons'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function LoansPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const queryClient = useQueryClient()

  const { data: groups = [] } = useQuery({
    queryKey: ['groups-options'],
    queryFn: () => groupService.getAllOptions(),
  })

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans', search, statusFilter],
    queryFn: () => loanService.getAll({ search, status: statusFilter }),
  })

  const { data: customers = [] } = useQuery({
    queryKey: ['customers-all'],
    queryFn: () => customerService.getAll(),
  })

  const deleteMutation = useMutation({
    mutationFn: loanService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loans'] }),
  })

  const getCustomerName = (id) => customers.find((c) => c.id === id)?.name || id
  const getGroupName = (id) => groups.find((g) => g.value === id)?.label || id

  const columns = [
    { key: 'id', label: 'Loan ID', width: 100 },
    {
      key: 'customerId',
      label: 'Customer',
      render: (v, row) => (
        <div>
          <p className="font-medium text-foreground">{getCustomerName(v)}</p>
          <p className="text-xs text-muted-foreground">{getGroupName(row.groupId)}</p>
        </div>
      ),
    },
    { key: 'amount', label: 'Amount', render: (v) => <span className="font-semibold">{formatCurrency(v)}</span> },
    { key: 'interestRate', label: 'Rate', render: (v) => `${v}%` },
    { key: 'durationMonths', label: 'Duration', render: (v) => `${v} mo.` },
    { key: 'emiAmount', label: 'EMI', render: (v) => formatCurrency(v) },
    {
      key: 'paidEmis',
      label: 'Progress',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${Math.min(100, (v / row.durationMonths) * 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{v}/{row.durationMonths}</span>
        </div>
      ),
    },
    { key: 'outstandingAmount', label: 'Outstanding', render: (v) => <span className="text-destructive font-medium">{formatCurrency(v)}</span> },
    { key: 'disbursedDate', label: 'Disbursed', render: (v) => formatDate(v) },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    {
      key: 'actions',
      label: '',
      width: 80,
      render: (_, row) => (
        <ActionButtons
          viewTo={`/loans/${row.id}`}
          editTo={`/loans/${row.id}/edit`}
          onDelete={() => deleteMutation.mutateAsync(row.id)}
        />
      ),
    },
  ]

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Loans"
        description={`${loans.length} loan records`}
        action={{ label: 'Add Loan', to: '/loans/create' }}
        onExport={() => exportToExcel(loans, columns, 'loans.xlsx')}
        onPrint={() => window.print()}
      />
      <DataTableLayout
        columns={columns}
        data={loans}
        loading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by loan ID or purpose..."
        emptyIcon={CreditCard}
        emptyTitle="No loans found"
        filterSlot={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm rounded-xl border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Status</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="defaulted">Defaulted</option>
          </select>
        }
      />
    </div>
  )
}
