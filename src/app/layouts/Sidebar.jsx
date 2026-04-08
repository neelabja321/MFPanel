import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  PiggyBank,
  UsersRound,
  ArrowLeftRight,
  ChevronLeft,
  Landmark,
} from 'lucide-react'
import { useUIStore } from '@/store'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/loans', icon: CreditCard, label: 'Loans' },
  { to: '/savings', icon: PiggyBank, label: 'Savings' },
  { to: '/groups', icon: UsersRound, label: 'Groups' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={toggleSidebar}
        />
      )}
      <aside
        className={cn(
          'absolute md:relative z-40 h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 ease-in-out shrink-0',
          sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-16'
        )}
      >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-sidebar-primary shrink-0">
          <Landmark className="w-5 h-5 text-white" />
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <p className="font-bold text-white text-sm leading-tight">MF Admin</p>
            <p className="text-xs text-sidebar-foreground/60 leading-tight">Microfinance Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-sidebar-primary text-white shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white'
              )
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-border shadow-md text-muted-foreground hover:text-primary transition-colors"
      >
        <ChevronLeft
          className={cn('w-3.5 h-3.5 transition-transform duration-300', !sidebarOpen && 'rotate-180')}
        />
      </button>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        {sidebarOpen ? (
          <p className="text-xs text-sidebar-foreground/40 text-center">v1.0.0 — April 2026</p>
        ) : (
          <div className="w-2 h-2 rounded-full bg-green-400 mx-auto" title="System online" />
        )}
      </div>
    </aside>
    </>
  )
}
