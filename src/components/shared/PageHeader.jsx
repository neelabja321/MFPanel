import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Download, Printer } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PageHeader({ title, description, action, backTo, onExport, onPrint, className }) {
  const navigate = useNavigate()

  return (
    <div className={cn('flex items-start justify-between mb-6', className)}>
      <div className="flex items-start gap-3">
        {backTo && (
          <button
            onClick={() => navigate(backTo)}
            className="mt-0.5 p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors print:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {description && <p className="text-sm text-muted-foreground mt-0.5 print:hidden">{description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 print:hidden">
        {onPrint && (
           <button onClick={onPrint} className="p-2 text-muted-foreground bg-accent/50 hover:bg-accent rounded-xl transition-colors shrink-0" title="Print List">
             <Printer className="w-4 h-4" />
           </button>
        )}
        {onExport && (
           <button onClick={onExport} className="p-2 text-muted-foreground bg-accent/50 hover:bg-accent rounded-xl transition-colors shrink-0" title="Export to Excel">
             <Download className="w-4 h-4" />
           </button>
        )}
        {action && (
          <button
            onClick={action.onClick || (() => navigate(action.to))}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm ml-2 shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        )}
      </div>
    </div>
  )
}
