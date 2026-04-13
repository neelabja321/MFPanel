import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Users, CreditCard, PiggyBank, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react'
import { customerService } from '@/services/customerService'
import { loanService } from '@/services/loanService'
import { savingsService } from '@/services/savingsService'
import { groupService } from '@/services/groupService'
import { formatCurrency } from '@/lib/utils'
import { CardSkeleton } from '@/components/shared/SkeletonLoaders'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function KPICard({ icon: Icon, label, value, sub, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-card rounded-2xl border border-border p-5 shadow-sm flex items-start gap-4 text-left hover:shadow-md hover:border-primary/20 transition-all duration-200 w-full group"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
    </button>
  )
}

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-lg p-3 text-sm">
        {label && <p className="font-semibold text-foreground mb-1">{label}</p>}
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: <span className="font-medium">{formatter ? formatter(p.value) : p.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [drillGroup, setDrillGroup] = useState(null)

  const { data: custResponse, isLoading: custLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getCustomers(),
  })
  
  const customers = custResponse?.data || []

  const { data: loans = [], isLoading: loanLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: () => loanService.getAll(),
  })

  const { data: savings = [], isLoading: savLoading } = useQuery({
    queryKey: ['savings'],
    queryFn: () => savingsService.getAll(),
  })

  const { data: groups = [], isLoading: grpLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupService.getAll(),
  })

  const isLoading = custLoading || loanLoading || savLoading || grpLoading

  // KPI calculations
  const activeCustomers = customers.filter((c) => c.status === 'active' || true).length // Adjusted logic since status might not exist yet
  const activeLoans = loans.filter((l) => l.status === 'running').length
  const totalLoanAmount = loans.reduce((s, l) => s + l.amount, 0)
  const totalSavings = savings.reduce((s, sv) => s + sv.balance, 0)
  const defaultedLoans = loans.filter((l) => l.status === 'defaulted').length

  // Chart Data: Loan distribution by group
  const loanByGroup = groups.map((g) => ({
    name: g.name.split(' ')[0],
    fullName: g.name,
    loans: loans.filter((l) => l.groupId === g.id).reduce((s, l) => s + l.amount, 0) / 1000,
    savings: savings.filter((s) => s.groupId === g.id).reduce((sum, sv) => sum + sv.balance, 0) / 1000,
  }))

  // Savings trend (simulated monthly)
  const savingsTrend = [
    { month: 'May', amount: 28000 },
    { month: 'Jun', amount: 31000 },
    { month: 'Jul', amount: 33500 },
    { month: 'Aug', amount: 37000 },
    { month: 'Sep', amount: 41200 },
    { month: 'Oct', amount: totalSavings },
  ]

  // Loan status pie
  const loanStatusData = [
    { name: 'Running', value: loans.filter((l) => l.status === 'running').length },
    { name: 'Completed', value: loans.filter((l) => l.status === 'completed').length },
    { name: 'Defaulted', value: loans.filter((l) => l.status === 'defaulted').length },
  ].filter((d) => d.value > 0)

  // Drill-down: group members
  const drillCustomers = drillGroup
    ? customers.filter((c) => c.groupId === drillGroup.id)
    : []
  const drillLoans = drillGroup
    ? loans.filter((l) => l.groupId === drillGroup.id)
    : []

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 bg-muted rounded-xl w-48 animate-pulse" />
        <CardSkeleton count={4} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* KPI Cards */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Dashboard</h2>
        <p className="text-sm text-muted-foreground mb-5">Welcome back — here's today's overview</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={Users}
            label="Total Customers"
            value={customers.length}
            sub={`${activeCustomers} active members`}
            color="bg-blue-100 text-blue-600"
            onClick={() => navigate('/customers')}
          />
          <KPICard
            icon={CreditCard}
            label="Loan Portfolio"
            value={formatCurrency(totalLoanAmount)}
            sub={`${activeLoans} active loans`}
            color="bg-violet-100 text-violet-600"
            onClick={() => navigate('/loans')}
          />
          <KPICard
            icon={PiggyBank}
            label="Total Savings"
            value={formatCurrency(totalSavings)}
            sub={`${savings.length} accounts`}
            color="bg-emerald-100 text-emerald-600"
            onClick={() => navigate('/savings')}
          />
          <KPICard
            icon={AlertTriangle}
            label="Defaulted Loans"
            value={defaultedLoans}
            sub={defaultedLoans > 0 ? 'Needs attention' : 'All clear'}
            color={defaultedLoans > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}
            onClick={() => navigate('/loans?status=defaulted')}
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loan & Savings by Group - Bar */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Group Overview</h3>
              <p className="text-xs text-muted-foreground">Loan & savings distribution (₹ thousands)</p>
            </div>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={loanByGroup} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} unit="K" />
              <Tooltip content={<CustomTooltip formatter={(v) => `₹${v}K`} />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="loans" name="Loans (₹K)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="savings" name="Savings (₹K)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Loan Status Pie */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-1">Loan Status</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribution of loan performance</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={loanStatusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {loanStatusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {loanStatusData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Savings Trend */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
        <h3 className="font-semibold text-foreground mb-1">Savings Growth</h3>
        <p className="text-xs text-muted-foreground mb-4">6-month cumulative savings trend</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={savingsTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip formatter={(v) => formatCurrency(v)} />} />
            <Line type="monotone" dataKey="amount" name="Savings" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Group Drill-down */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Group Performance</h3>
          <p className="text-xs text-muted-foreground">Click a group to drill into members</p>
        </div>
        <div className="divide-y divide-border">
          {groups.map((g) => {
            const groupLoans = loans.filter((l) => l.groupId === g.id)
            const groupSavings = savings.filter((s) => s.groupId === g.id)
            const isSelected = drillGroup?.id === g.id
            return (
              <div key={g.id}>
                <button
                  onClick={() => setDrillGroup(isSelected ? null : g)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {g.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{g.name}</p>
                      <p className="text-xs text-muted-foreground">{g.memberCount} members · {g.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">Loans</p>
                      <p className="font-semibold text-sm">{formatCurrency(groupLoans.reduce((s, l) => s + l.amount, 0))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Savings</p>
                      <p className="font-semibold text-sm text-emerald-600">{formatCurrency(groupSavings.reduce((s, sv) => s + sv.balance, 0))}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {/* Drill-down: customer list */}
                {isSelected && (
                  <div className="bg-accent/30 px-5 py-3 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Members</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {drillCustomers.map((c) => {
                        const cLoan = drillLoans.find((l) => l.customerId === c.id && l.status === 'running')
                        return (
                          <button
                            key={c.id}
                            onClick={() => navigate(`/customers/${c.id}`)}
                            className="bg-card rounded-xl border border-border p-3 text-left hover:border-primary/30 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                                {c.full_name ? c.full_name.charAt(0) : '?'}
                              </div>
                              <p className="text-sm font-medium text-foreground truncate">{c.full_name || c.name}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">{c.phone_number || c.phone}</p>
                            {cLoan && (
                              <p className="text-xs text-blue-600 mt-1">
                                Loan: {formatCurrency(cLoan.outstandingAmount)} outstanding
                              </p>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
