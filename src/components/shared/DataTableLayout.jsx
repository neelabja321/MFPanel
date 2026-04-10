import { useState, useMemo, useEffect } from 'react'
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown } from 'lucide-react'
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
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // Reset pagination on external filter/data scope change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchValue, data?.length])

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedData = useMemo(() => {
    if (!data) return []
    const sortableData = [...data]
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        const valA = a[sortConfig.key]
        const valB = b[sortConfig.key]
        if (valA == null) return sortConfig.direction === 'asc' ? -1 : 1
        if (valB == null) return sortConfig.direction === 'asc' ? 1 : -1
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return sortableData
  }, [data, sortConfig])

  // Pagination bounds
  const totalPages = Math.ceil(sortedData.length / rowsPerPage) || 1
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  return (
    <div className={cn('bg-card rounded-2xl border border-border shadow-sm flex flex-col print:border-none print:shadow-none', className)}>
      {/* Toolbar */}
      {(onSearchChange || filterSlot) && (
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border shrink-0 print:hidden">
          {onSearchChange && (
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder || 'Search...'}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
            </div>
          )}
          {filterSlot}
        </div>
      )}

      {/* Table Area */}
      <div className="overflow-x-auto min-h-[300px] flex-1 p-4 print:overflow-visible print:w-full print:p-0">
        {loading ? (
          <TableSkeleton rows={rowsPerPage} cols={columns?.length || 5} />
        ) : !data || data.length === 0 ? (
          <div className="mt-8">
             <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
          </div>
        ) : (
          <table className="w-full text-sm shrink-0">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.key !== 'actions' && handleSort(col.key)}
                    className={cn(
                      "text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-4 pr-4 border-b border-border select-none",
                      col.key !== 'actions' && "cursor-pointer hover:text-foreground transition-colors group"
                    )}
                    style={{ width: col.width }}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      {col.key !== 'actions' && (
                        <ArrowUpDown className={cn(
                          "w-3 h-3 text-muted-foreground/40 transition-colors", 
                          sortConfig.key === col.key ? "text-primary" : "group-hover:text-muted-foreground"
                        )} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, idx) => (
                <tr
                  key={row.id || row.userId || idx}
                  className="border-b border-border/50 hover:bg-muted/50 transition-colors group/row last:border-none"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="py-3.5 pr-4 align-middle group-first/row:pt-4 group-last/row:pb-0">
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && data && data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border bg-slate-50/50 rounded-b-2xl print:hidden shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="bg-transparent font-medium text-foreground outline-none border border-input rounded-md px-1 py-0.5"
            >
              {[5, 10, 20, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-sm font-medium text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 md:p-2 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="First page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 md:p-2 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 md:p-2 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 md:p-2 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
