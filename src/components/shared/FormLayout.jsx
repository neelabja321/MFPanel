import { forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function FormLayout({ title, description, onSubmit, loading, backTo, children, submitLabel }) {
  const navigate = useNavigate()

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="max-w-2xl">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          {title && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
            </div>
          )}
          <div className="space-y-5">{children}</div>
          <div className="flex gap-3 mt-8 pt-6 border-t border-border">
            {backTo && (
              <button
                type="button"
                onClick={() => navigate(backTo)}
                className="px-5 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60',
                loading && 'cursor-not-allowed'
              )}
            >
              {loading ? 'Saving...' : (submitLabel || 'Save')}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

export function FormField({ label, error, required, children, hint }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

export const FormInput = forwardRef(({ error, className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full px-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow',
        error && 'border-destructive focus:ring-destructive/30',
        className
      )}
      {...props}
    />
  )
})
FormInput.displayName = 'FormInput'

export const FormSelect = forwardRef(({ error, className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full px-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow',
        error && 'border-destructive focus:ring-destructive/30',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
})
FormSelect.displayName = 'FormSelect'

export const FormTextarea = forwardRef(({ error, className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      rows={3}
      className={cn(
        'w-full px-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none',
        error && 'border-destructive focus:ring-destructive/30',
        className
      )}
      {...props}
    />
  )
})
FormTextarea.displayName = 'FormTextarea'
