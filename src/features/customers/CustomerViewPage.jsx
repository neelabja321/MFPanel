import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { User, Phone, MapPin, CreditCard, Users, Calendar } from 'lucide-react'
import { customerService } from '@/services/customerService'
import { groupService } from '@/services/groupService'
import { loanService } from '@/services/loanService'
import { savingsService } from '@/services/savingsService'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { FormSkeleton } from '@/components/shared/SkeletonLoaders'

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground mt-0.5">{value || '-'}</p>
      </div>
    </div>
  )
}

export default function CustomerViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: customerResponse, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.getCustomerById(id),
  })

  const customer = customerResponse?.data

  const { data: groups = [] } = useQuery({
    queryKey: ['groups-options'],
    queryFn: () => groupService.getAllOptions(),
  })

  const { data: loans = [] } = useQuery({
    queryKey: ['loans-customer', id],
    queryFn: () => loanService.getAll({ customerId: id }),
  })

  const { data: savings } = useQuery({
    queryKey: ['savings-customer', id],
    queryFn: () => savingsService.getByCustomer(id),
  })

  if (isLoading) return <FormSkeleton />
  if (!customer) return <p className="text-muted-foreground">Customer not found.</p>

  const groupLabel = groups.find((g) => g.value === customer.groupId)?.label || customer.groupId

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={customer.name}
        description={`Customer ID: ${customer.id}`}
        backTo="/customers"
        action={{ label: 'Edit', to: `/customers/${id}/edit` }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{customer.full_name || customer.name}</h3>
              <StatusBadge status={customer.status || 'active'} className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InfoCard icon={Phone} label="Phone" value={customer.phone_number || customer.phone} />
            <InfoCard icon={Calendar} label="Joined" value={formatDate(customer.created_at || customer.joinDate || new Date())} />
            <InfoCard icon={MapPin} label="Address" value={customer.address} />
            <InfoCard icon={CreditCard} label={`${customer.id_proof_type || customer.idProof || 'ID'}`} value={customer.id_proof_number || customer.idNumber} />
            <InfoCard icon={Users} label="Group" value={groupLabel} />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Active Loans</p>
            <p className="text-3xl font-bold text-foreground">
              {loans.filter((l) => l.status === 'running').length}
            </p>
            <button
              onClick={() => navigate(`/loans?customerId=${id}`)}
              className="text-xs text-primary mt-1 hover:underline"
            >
              View all loans →
            </button>
          </div>
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Savings Balance</p>
            <p className="text-3xl font-bold text-foreground">
              {savings ? formatCurrency(savings.balance) : '—'}
            </p>
            <StatusBadge status={savings?.status || 'inactive'} className="mt-1" />
          </div>
        </div>
      </div>
    </div>
  )
}
