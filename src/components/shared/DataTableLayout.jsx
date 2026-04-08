import { Search } from 'lucide-react'
import EmptyState from './EmptyState'
import { TableSkeleton } from './SkeletonLoaders'
import { cn } from '@/lib/utils'

export default function DataTableLayout({
  columns,
  data,
  loading,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  filterSlot,
  className,
}) {
  return (
    <div className={cn('bg-card rounded-2xl border border-border shadow-sm', className)}>
      {/* Toolbar */}
      {(onSearchChange || filterSlot) && (
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
          {onSearchChange && (
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder || 'Search...'}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
          {filterSlot}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto p-4">
        {loading ? (
          <TableSkeleton rows={5} cols={columns?.length || 5} />
        ) : !data || data.length === 0 ? (
          <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3 pr-4"
                    style={{ width: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="border-t border-border hover:bg-accent/40 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="py-3 pr-4 align-middle">
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
