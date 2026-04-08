import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PiggyBank, TrendingUp, TrendingDown } from 'lucide-react'
import { savingsService } from '@/services/savingsService'
import { customerService } from '@/services/customerService'
import { groupService } from '@/services/groupService'
import DataTableLayout from '@/components/shared/DataTableLayout'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function SavingsPage() {
  const [groupFilter, setGroupFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: groups = [] } = useQuery({
    queryKey: ['groups-options'],
    queryFn: () => groupService.getAllOptions(),
  })
  const { data: customers = [] } = useQuery({
    queryKey: ['customers-all'],
    queryFn: () => customerService.getAll(),
  })
  const { data: savings = [], isLoading } = useQuery({
    queryKey: ['savings', groupFilter, statusFilter],
    queryFn: () => savingsService.getAll({ groupId: groupFilter, status: statusFilter }),
  })

  const getCustomerName = (id) => customers.find((c) => c.id === id)?.name || id
  const getGroupName = (id) => groups.find((g) => g.value === id)?.label || id

  const totalBalance = savings.reduce((sum, s) => sum + s.balance, 0)

  const columns = [
    { key: 'id', label: 'Account ID', width: 100 },
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
    {
      key: 'balance',
      label: 'Balance',
      render: (v) => <span className="font-semibold text-emerald-600">{formatCurrency(v)}</span>,
    },
    { key: 'openedDate', label: 'Opened', render: (v) => formatDate(v) },
    { key: 'lastTransactionDate', label: 'Last Activity', render: (v) => formatDate(v) },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
  ]

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Savings"
        description="Member savings accounts"
        action={{ label: 'Open Account', to: '/savings/create' }}
      />

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-sm font-medium text-emerald-100">Total Savings Pool</p>
        <p className="text-4xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
        <p className="text-xs text-emerald-200 mt-2">{savings.length} active accounts</p>
      </div>

      <DataTableLayout
        columns={columns}
        data={savings}
        loading={isLoading}
        emptyIcon={PiggyBank}
        emptyTitle="No savings accounts found"
        filterSlot={
          <div className="flex gap-2">
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
              <option value="frozen">Frozen</option>
            </select>
          </div>
        }
      />
    </div>
  )
}
