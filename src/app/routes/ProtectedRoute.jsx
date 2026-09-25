import { useEffect } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { RefreshCw, LogOut, ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@/store'
import { accessService } from '@/services/accessService'
import { getApiError } from '@/lib/utils'

const PERMISSION_REFRESH_MS = 5 * 60 * 1000

export default function ProtectedRoute() {
  const navigate = useNavigate()
  const {
    isAuthenticated,
    user,
    permissionStatus,
    permissionError,
    setPermissionLoading,
    setPermissions,
    setPermissionError,
    retryPermissions,
    logout,
  } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || permissionStatus !== 'idle') return

    const startedToken = localStorage.getItem('authToken')
    setPermissionLoading()

    accessService.getCurrentUserAccess(user)
      .then((result) => {
        const current = useAuthStore.getState()
        if (current.isAuthenticated && localStorage.getItem('authToken') === startedToken) {
          setPermissions(result)
        }
      })
      .catch((error) => {
        const current = useAuthStore.getState()
        if (current.isAuthenticated && localStorage.getItem('authToken') === startedToken) {
          setPermissionError(getApiError(error).message || error.message)
        }
      })
  }, [
    isAuthenticated,
    user,
    permissionStatus,
    setPermissionLoading,
    setPermissions,
    setPermissionError,
  ])

  useEffect(() => {
    if (!isAuthenticated) return undefined

    const refreshIfReady = () => {
      if (useAuthStore.getState().permissionStatus === 'ready') retryPermissions()
    }
    window.addEventListener('focus', refreshIfReady)
    const interval = window.setInterval(refreshIfReady, PERMISSION_REFRESH_MS)

    return () => {
      window.removeEventListener('focus', refreshIfReady)
      window.clearInterval(interval)
    }
  }, [isAuthenticated, retryPermissions])

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (permissionStatus === 'idle' || permissionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center text-muted-foreground">
          <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3 text-primary" />
          <p className="font-medium">Loading your role permissions...</p>
        </div>
      </div>
    )
  }

  if (permissionStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-sm p-7 text-center">
          <ShieldAlert className="w-10 h-10 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground">Permissions unavailable</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {permissionError || 'Your role access matrix could not be loaded.'}
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={retryPermissions}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium"
            >
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <Outlet />
}
