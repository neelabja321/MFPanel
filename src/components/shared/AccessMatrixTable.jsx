import { Check, Minus } from 'lucide-react'
import { PERMISSION_FIELDS, MODULE_GATE_FIELD } from '@/lib/accessMatrix'

/**
 * Module × permission grid for a role's access matrix.
 *
 * Renders toggles when `onChange` is supplied, otherwise a read-only
 * check/dash view. `total_access` gates the row: with it off the remaining
 * toggles are disabled, which mirrors how the API stores the matrix.
 */
export default function AccessMatrixTable({
  rows = [],
  onChange,
  onToggleModule,
  loading = false,
  readOnly = false,
}) {
  const editable = !readOnly && typeof onChange === 'function'
  const columnCount = PERMISSION_FIELDS.length + (editable ? 2 : 1)

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Loading access matrix...
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-sm">
        <caption className="sr-only">
          Module permissions for this role
        </caption>
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th scope="col" className="px-6 py-3 font-semibold text-muted-foreground">Module</th>
            {PERMISSION_FIELDS.map((f) => (
              <th
                key={f.key}
                scope="col"
                className="px-6 py-3 font-semibold text-muted-foreground text-center whitespace-nowrap"
              >
                {f.label}
              </th>
            ))}
            {editable && <th scope="col" className="px-6 py-3 text-right" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((item, index) => {
            const gated = item[MODULE_GATE_FIELD] !== 1
            const allGranted = PERMISSION_FIELDS.every((f) => item[f.key] === 1)

            return (
              <tr key={item.module || index} className="hover:bg-muted/30 transition-colors">
                <th scope="row" className="px-6 py-4 font-medium text-foreground text-left">
                  {item.module}
                </th>

                {PERMISSION_FIELDS.map((f) => {
                  const granted = item[f.key] === 1
                  const disabled = f.key !== MODULE_GATE_FIELD && gated

                  if (!editable) {
                    return (
                      <td key={f.key} className="px-6 py-4 text-center">
                        {granted ? (
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700"
                            title={`${f.label}: allowed`}
                          >
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            <span className="sr-only">{f.label} allowed</span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground"
                            title={`${f.label}: not allowed`}
                          >
                            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                            <span className="sr-only">{f.label} not allowed</span>
                          </span>
                        )}
                      </td>
                    )
                  }

                  return (
                    <td key={f.key} className="px-6 py-4 text-center">
                      <label className="inline-flex relative items-center cursor-pointer">
                        <span className="sr-only">{`${f.label} for ${item.module}`}</span>
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={granted}
                          disabled={disabled}
                          onChange={(e) => onChange(index, f.key, e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-muted peer-focus-visible:outline-none peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-40 peer-disabled:cursor-not-allowed" />
                      </label>
                    </td>
                  )
                })}

                {editable && (
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    {typeof onToggleModule === 'function' && (
                      <button
                        type="button"
                        onClick={() => onToggleModule(index, !allGranted)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {allGranted ? 'Clear all' : 'Allow all'}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            )
          })}

          {rows.length === 0 && (
            <tr>
              <td colSpan={columnCount} className="px-6 py-8 text-center text-muted-foreground">
                No modules available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
