import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Landmark, Lock } from 'lucide-react'
import { useAuthStore } from '@/store'
import { FormField, FormInput } from '@/components/shared/FormLayout'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simulate network delay
    setTimeout(() => {
      if (login(username, password)) {
        navigate('/')
      } else {
        setError('Invalid credentials (try: admin / admin123)')
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Landmark className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 mb-2">Microfinance Panel</h2>
        <p className="text-center text-sm text-slate-600">Sign in to manage your branch operations</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormField label="Username" required>
              <FormInput
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="rounded-xl border-slate-200"
                autoComplete="username"
                required
              />
            </FormField>

            <FormField label="Password" required>
              <FormInput
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl border-slate-200"
                autoComplete="current-password"
                required
              />
            </FormField>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20 flex items-start gap-2">
                <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || !username || !password}
                className={cn(
                  'w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200',
                  (loading || !username || !password) && 'opacity-60 cursor-not-allowed hover:bg-primary'
                )}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
        
        <p className="text-center text-xs text-slate-400 mt-8">
          © 2026 Admin Systems Inc.
        </p>
      </div>
    </div>
  )
}
