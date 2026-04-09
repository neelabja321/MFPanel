import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Menu, LogOut, Sun, Moon } from 'lucide-react'
import { useUIStore, useAuthStore } from '@/store'

const routeLabels = {
  '/': 'Dashboard',
  '/customers': 'Customers',
  '/customers/create': 'Add Customer',
  '/loans': 'Loans',
  '/loans/create': 'Add Loan',
  '/savings': 'Savings',
  '/groups': 'Groups',
  '/groups/create': 'Add Group',
  '/transactions': 'Transactions',
}

export default function Header() {
  const { toggleSidebar, theme, toggleTheme } = useUIStore()
  const logout = useAuthStore((s) => s.logout)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getLabel = () => {
    const path = location.pathname
    const exact = routeLabels[path]
    if (exact) return exact
    if (path.includes('/edit')) return 'Edit Record'
    if (path.includes('/view')) return 'View Details'
    return 'Admin Panel'
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 shrink-0 bg-background border-b border-border print:hidden">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">{getLabel()}</h1>
          <p className="text-xs text-muted-foreground">
            {new Intl.DateTimeFormat('en-IN', { dateStyle: 'full' }).format(new Date())}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="relative p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold select-none">
            A
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground leading-tight">Admin</p>
            <p className="text-xs text-muted-foreground leading-tight">Manager</p>
          </div>
          <button 
            onClick={handleLogout}
            className="ml-2 p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
