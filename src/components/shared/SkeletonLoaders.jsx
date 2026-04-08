import { cn } from '@/lib/utils'

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-muted rounded-lg mb-3" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={cn('flex gap-4 py-3 border-b border-border', i === rows - 1 && 'border-0')}>
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-5 bg-muted rounded"
              style={{ flex: j === 0 ? '0 0 60px' : 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-2xl p-6 border border-border">
          <div className="h-4 bg-muted rounded w-24 mb-3" />
          <div className="h-8 bg-muted rounded w-32 mb-2" />
          <div className="h-3 bg-muted rounded w-20" />
        </div>
      ))}
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-muted rounded w-24 mb-2" />
          <div className="h-10 bg-muted rounded-xl" />
        </div>
      ))}
    </div>
  )
}
