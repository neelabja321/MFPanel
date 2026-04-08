import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { loanService } from '@/services/loanService'
import { customerService } from '@/services/customerService'
import { groupService } from '@/services/groupService'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FormSkeleton } from '@/components/shared/SkeletonLoaders'
import { CreditCard } from 'lucide-react'

function StatCard({ label, value, sub, highlight }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      <p className="text-xs font-medium text-muted-foreground uppercase mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-destructive' : 'text-foreground'}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

export default function LoanViewPage() {
  const { id } = useParams()

  const { data: loan, isLoading } = useQuery({ queryKey: ['loan', id], queryFn: () => loanService.getById(id) })
  const { data: schedule = [], isLoading: schedLoading } = useQuery({ queryKey: ['emi-schedule', id], queryFn: () => loanService.getEmiSchedule(id) })
  const { data: customers = [] } = useQuery({ queryKey: ['customers-all'], queryFn: () => customerService.getAll() })
  const { data: groups = [] } = useQuery({ queryKey: ['groups-options'], queryFn: () => groupService.getAllOptions() })

  if (isLoading) return <FormSkeleton />
  if (!loan) return <p className="text-muted-foreground">Loan not found.</p>

  const customer = customers.find((c) => c.id === loan.customerId)
  const group = groups.find((g) => g.value === loan.groupId)

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={`Loan: ${loan.id}`}
        description={`${customer?.name || loan.customerId} — ${group?.label || loan.groupId}`}
        backTo="/loans"
        action={{ label: 'Edit', to: `/loans/${id}/edit` }}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Loan Amount" value={formatCurrency(loan.amount)} />
        <StatCard label="EMI Amount" value={formatCurrency(loan.emiAmount)} sub={`${loan.durationMonths} months`} />
        <StatCard label="Outstanding" value={formatCurrency(loan.outstandingAmount)} highlight />
        <StatCard label="EMIs Paid" value={`${loan.paidEmis} / ${loan.durationMonths}`} sub={`${Math.round((loan.paidEmis / loan.durationMonths) * 100)}% paid`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-3">
          <h3 className="font-semibold text-foreground">Loan Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={loan.status} /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Interest Rate</span><span className="font-medium">{loan.interestRate}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Disbursed</span><span>{formatDate(loan.disbursedDate)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Due Date</span><span>{formatDate(loan.dueDate)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Purpose</span><span className="text-right max-w-[150px]">{loan.purpose}</span></div>
          </div>
        </div>

        <div className="md:col-span-2 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">EMI Schedule</h3>
          </div>
          <div className="overflow-y-auto max-h-72 scrollbar-thin">
            {schedLoading ? (
              <div className="p-4 animate-pulse space-y-2">
                {[...Array(6)].map((_, i) => <div key={i} className="h-8 bg-muted rounded" />)}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">#</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Due Date</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Amount</th>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((emi) => (
                    <tr key={emi.emiNumber} className="border-t border-border">
                      <td className="px-4 py-2.5 text-muted-foreground">{emi.emiNumber}</td>
                      <td className="px-4 py-2.5">{formatDate(emi.dueDate)}</td>
                      <td className="px-4 py-2.5 font-medium">{formatCurrency(emi.amount)}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={emi.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
