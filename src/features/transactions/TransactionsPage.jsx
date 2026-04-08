import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftRight, ArrowDownCircle, ArrowUpCircle, Receipt } from 'lucide-react'
import { transactionService } from '@/services/transactionService'
import { groupService } from '@/services/groupService'
import { customerService } from '@/services/customerService'
import DataTableLayout from '@/components/shared/DataTableLayout'
import PageHeader from '@/components/shared/PageHeader'
import { formatCurrency, formatDate } from '@/lib/utils'

const typeConfig = {
  loan_payment: { label: 'Loan Payment', icon: Receipt, color: 'text-blue-600 bg-blue-50' },
  savings_deposit: { label: 'Savings Deposit', icon: ArrowDownCircle, color: 'text-emerald-600 bg-emerald-50' },
  savings_withdrawal: { label: 'Withdrawal', icon: ArrowUpCircle, color: 'text-amber-600 bg-amber-50' },
}

export default function TransactionsPage() {
  const [groupFilter, setGroupFilter] = useState('')
  const [customerFilter, setCustomerFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [filteredCustomers, setFilteredCustomers] = useState([])

  const { data: groups = [] } = useQuery({ queryKey: ['groups-options'], queryFn: () => groupService.getAllOptions() })
  const { data: allCustomers = [] } = useQuery({ queryKey: ['customers-all'], queryFn: () => customerService.getAll() })

  useEffect(() => {
    setCustomerFilter('')
    if (groupFilter) {
      setFilteredCustomers(allCustomers.filter((c) => c.groupId === groupFilter))
    } else {
      setFilteredCustomers(allCustomers)
    }
  }, [groupFilter, allCustomers])

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', groupFilter, customerFilter, typeFilter, dateFrom, dateTo],
    queryFn: () =>
      transactionService.getAll({
        groupId: groupFilter,
        customerId: customerFilter,
        type: typeFilter,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }),
  })

  const getCustomerName = (id) => allCustomers.find((c) => c.id === id)?.name || id
  const getGroupName = (id) => groups.find((g) => g.value === id)?.label || id

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)

  const columns = [
    { key: 'id', label: 'Txn ID', width: 110 },
    {
      key: 'type',
      label: 'Type',
      render: (v) => {
        const cfg = typeConfig[v] || { label: v, color: 'text-gray-600 bg-gray-50' }
        const Icon = cfg.icon
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {cfg.label}
          </span>
        )
      },
    },
    {
      key: 'customerId',
      label: 'Customer',
      render: (v, row) => (
        <div>
          <p className="text-sm font-medium">{getCustomerName(v)}</p>
          <p className="text-xs text-muted-foreground">{getGroupName(row.groupId)}</p>
        </div>
      ),
    },
    { key: 'amount', label: 'Amount', render: (v) => <span className="font-semibold">{formatCurrency(v)}</span> },
    { key: 'date', label: 'Date', render: (v) => formatDate(v) },
    { key: 'method', label: 'Method', render: (v) => <span className="capitalize text-xs bg-muted px-2 py-0.5 rounded">{v}</span> },
    { key: 'note', label: 'Note', render: (v) => <span className="text-xs text-muted-foreground">{v}</span> },
  ]

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Transactions" description="All financial activity" />

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-xs text-blue-600 font-medium">Loan Payments</p>
          <p className="text-2xl font-bold text-blue-700">
            {formatCurrency(transactions.filter((t) => t.type === 'loan_payment').reduce((s, t) => s + t.amount, 0))}
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
          <p className="text-xs text-emerald-600 font-medium">Savings Deposits</p>
          <p className="text-2xl font-bold text-emerald-700">
            {formatCurrency(transactions.filter((t) => t.type === 'savings_deposit').reduce((s, t) => s + t.amount, 0))}
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <p className="text-xs text-amber-600 font-medium">Withdrawals</p>
          <p className="text-2xl font-bold text-amber-700">
            {formatCurrency(transactions.filter((t) => t.type === 'savings_withdrawal').reduce((s, t) => s + t.amount, 0))}
          </p>
        </div>
      </div>

      <DataTableLayout
        columns={columns}
        data={transactions}
        loading={isLoading}
        emptyIcon={ArrowLeftRight}
        emptyTitle="No transactions found"
        emptyDescription="Try adjusting filters to see transactions"
        filterSlot={
          <div className="flex flex-wrap gap-2">
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
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="text-sm rounded-xl border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Customers</option>
              {filteredCustomers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm rounded-xl border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Types</option>
              <option value="loan_payment">Loan Payment</option>
              <option value="savings_deposit">Savings Deposit</option>
              <option value="savings_withdrawal">Withdrawal</option>
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="text-sm rounded-xl border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              title="From date"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="text-sm rounded-xl border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
              title="To date"
            />
            {(groupFilter || customerFilter || typeFilter || dateFrom || dateTo) && (
              <button
                onClick={() => { setGroupFilter(''); setCustomerFilter(''); setTypeFilter(''); setDateFrom(''); setDateTo('') }}
                className="text-sm px-3 py-2 rounded-xl border border-destructive text-destructive hover:bg-destructive/5 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        }
      />
    </div>
  )
}
