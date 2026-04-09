import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, ArrowRight, ShieldCheck, PieChart, Activity } from 'lucide-react'
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
    <div className="min-h-screen flex w-full">
      {/* Left side: Premium Branding */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative flex-col justify-between overflow-hidden p-12 group">
        {/* Abstract Background Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-primary/20 blur-[120px] pointer-events-none transition-all duration-1000 ease-out group-hover:scale-[1.15] group-hover:translate-x-12 group-hover:bg-primary/30" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none transition-all duration-1000 ease-out delay-75 group-hover:scale-[1.25] group-hover:-translate-y-12 group-hover:bg-blue-500/20" />

        <div className="relative z-10 flex items-center gap-4 animate-fade-in group/logo cursor-pointer w-max">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-white/10 shrink-0 overflow-hidden transition-all duration-500 group-hover/logo:scale-110 group-hover/logo:rotate-3 group-hover/logo:shadow-primary/20">
            <img src="/logo.png" alt="FinanceOrbit" className="w-full h-full object-cover" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-white transition-opacity duration-300 group-hover/logo:opacity-80">FinanceOrbit</span>
        </div>

        <div className="relative z-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight transition-transform duration-700 ease-out group-hover:translate-x-3">
            The next generation of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-400 bg-[length:200%_auto] transition-all duration-1000 hover:bg-right cursor-default">
              microfinance control.
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-md leading-relaxed mb-12 transition-transform duration-700 ease-out delay-75 group-hover:translate-x-3">
            Seamlessly manage your customers, loan portfolios, savings accounts, and transactions with our state-of-the-art admin dashboard.
          </p>

          <div className="space-y-3 max-w-md">
            {[
              { icon: ShieldCheck, text: "Enterprise-grade security standards" },
              { icon: PieChart, text: "Real-time analytical metrics" },
              { icon: Activity, text: "Frictionless transaction processing" }
            ].map((item, i) => (
              <div 
                key={i} 
                className="group/item flex items-center gap-4 text-slate-300 p-3 -ml-3 rounded-xl hover:bg-white/5 hover:backdrop-blur-md border border-transparent hover:border-white/10 transition-all duration-300 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 transition-all duration-300 group-hover/item:scale-110 group-hover/item:bg-primary/30 group-hover/item:text-white group-hover/item:shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                  <item.icon className="w-5 h-5 transition-transform duration-300 group-hover/item:-rotate-12" />
                </div>
                <span className="font-medium transition-colors duration-300 group-hover/item:text-white">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-500 font-medium transition-colors hover:text-slate-300 cursor-default w-max">
          © 2026 FinanceOrbit Ecosystem. All rights reserved.
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50 relative">
        <div className="w-full max-w-md space-y-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          {/* Mobile Logo visibility */}
          <div className="flex flex-col items-center lg:hidden mb-8">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-slate-100 shrink-0 overflow-hidden mb-4">
              <img src="/logo.png" alt="FinanceOrbit" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">FinanceOrbit</h2>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome back</h2>
            <p className="text-slate-500">Please enter your credentials to access the panel</p>
          </div>

          <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <FormField label="Username" required>
                <FormInput
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="rounded-xl border-slate-200 focus:border-primary focus:ring-primary h-12 text-black"
                  autoComplete="username"
                  required
                />
              </FormField>

              <FormField label="Password" required>
                <div className="flex justify-between items-end mb-1">
                  {/* The actual label is handled by FormField but we want to intercept the space right of it */}
                </div>
                <FormInput
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl border-slate-200 focus:border-primary focus:ring-primary h-12 text-black"
                  autoComplete="current-password"
                  required
                />
                <div className="flex justify-end mt-2">
                  <a href="#" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </FormField>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20 flex items-start gap-2 animate-fade-in">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !username || !password}
                className={cn(
                  'group w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200',
                  (loading || !username || !password) && 'opacity-60 cursor-not-allowed hover:bg-primary'
                )}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <a href="#" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Contact administrator
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
