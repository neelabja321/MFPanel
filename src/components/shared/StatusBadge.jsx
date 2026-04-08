import { cn } from '@/lib/utils'

const statusConfig = {
  active: { label: 'Active', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  inactive: { label: 'Inactive', classes: 'bg-slate-100 text-slate-600 border-slate-200' },
  running: { label: 'Running', classes: 'bg-blue-100 text-blue-700 border-blue-200' },
  completed: { label: 'Completed', classes: 'bg-green-100 text-green-700 border-green-200' },
  defaulted: { label: 'Defaulted', classes: 'bg-red-100 text-red-700 border-red-200' },
  frozen: { label: 'Frozen', classes: 'bg-amber-100 text-amber-700 border-amber-200' },
  pending: { label: 'Pending', classes: 'bg-orange-100 text-orange-700 border-orange-200' },
  paid: { label: 'Paid', classes: 'bg-green-100 text-green-700 border-green-200' },
}

export default function StatusBadge({ status, className }) {
  const config = statusConfig[status] || { label: status, classes: 'bg-gray-100 text-gray-600 border-gray-200' }
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.classes,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {config.label}
    </span>
  )
}
