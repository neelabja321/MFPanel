import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { useAuthStore } from '@/store'
import { canAccess, getFirstAllowedPath } from '@/lib/accessControl'

export function PermissionRoute({ module, permission, children }) {
  const permissions = useAuthStore((state) => state.permissions)
  const location = useLocation()

  if (!canAccess(permissions, module, permission)) {
    return <Navigate to="/access-denied" replace state={{ from: location.pathname }} />
  }
  return children
}

export function HomeRoute({ children }) {
  const permissions = useAuthStore((state) => state.permissions)
  if (canAccess(permissions, 'Master', 'list')) return children
  return <Navigate to={getFirstAllowedPath(permissions)} replace />
}

export function AccessDeniedPage() {
  const navigate = useNavigate()
  const permissions = useAuthStore((state) => state.permissions)
  const firstAllowedPath = getFirstAllowedPath(permissions)

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <ShieldX className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground">Access denied</h1>
        <p className="text-muted-foreground mt-2">
          Your assigned role does not have permission to access this page.
        </p>
        {firstAllowedPath !== '/access-denied' && (
          <button
            type="button"
            onClick={() => navigate(firstAllowedPath, { replace: true })}
            className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
          >
            Go to an allowed module
          </button>
        )}
      </div>
    </div>
  )
}
