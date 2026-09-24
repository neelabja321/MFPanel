import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Check, ArrowLeft, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { roleService } from '@/services/roleService'

const PERMISSION_FIELDS = [
  { key: 'total_access', label: 'Total Access' },
  { key: 'list', label: 'List' },
  { key: 'create_records', label: 'Create' },
  { key: 'edit_records', label: 'Edit' },
  { key: 'delete_records', label: 'Delete' },
]

// Normalize any module row into the exact shape the API expects (0/1 integers).
function normalizeModule(row) {
  return {
    module: row.module,
    total_access: row.total_access ? 1 : 0,
    list: row.list ? 1 : 0,
    create_records: row.create_records ? 1 : 0,
    edit_records: row.edit_records ? 1 : 0,
    delete_records: row.delete_records ? 1 : 0,
  }
}

export default function RoleAccessMatrix() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [accessMatrix, setAccessMatrix] = useState([])

  // Role record — used only to show the role name in the header.
  const { data: roleData } = useQuery({
    queryKey: ['role', id],
    queryFn: () => roleService.getById(id),
    enabled: !!id,
  })

  // Current per-role access matrix.
  const { data: matrixData, isLoading: matrixLoading } = useQuery({
    queryKey: ['role-access', id],
    queryFn: () => roleService.getAccessMatrix(id),
    enabled: !!id,
  })

  // Default module structure — used as a fallback when the role has no matrix yet.
  const { data: defaultModules } = useQuery({
    queryKey: ['access-modules'],
    queryFn: roleService.getAllModules,
    select: (data) => data?.default_structure ?? data,
  })

  useEffect(() => {
    // Prefer the role's saved access matrix; fall back to the default structure.
    const source =
      matrixData?.access ??
      (Array.isArray(matrixData) ? matrixData : null) ??
      defaultModules
    if (Array.isArray(source) && source.length) {
      setAccessMatrix(source.map(normalizeModule))
    }
  }, [matrixData, defaultModules])

  const saveMutation = useMutation({
    mutationFn: (access) => roleService.updateAccessMatrix(id, access),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-access', id] })
      toast.success('Access matrix updated successfully')
      navigate('/roles')
    },
    onError: (err) => {
      toast.error('Failed to update access matrix: ' + (err.response?.data?.message || err.message))
    },
  })

  const handleAccessChange = (index, field, checked) => {
    setAccessMatrix((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: checked ? 1 : 0 }
      return updated
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    saveMutation.mutate(accessMatrix.map(normalizeModule))
  }

  const roleName = roleData?.role ?? `#${id}`

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/roles')}
          className="p-2 hover:bg-muted rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Access Matrix: {roleName}
          </h1>
          <p className="text-muted-foreground mt-1">Configure module-level permissions for this role</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 pb-4 border-b border-border">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Module Permissions Matrix
            </h3>
          </div>

          {matrixLoading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading access matrix...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Module</th>
                    {PERMISSION_FIELDS.map((f) => (
                      <th key={f.key} className="px-6 py-3 font-semibold text-muted-foreground text-center">
                        {f.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {accessMatrix.map((item, index) => (
                    <tr key={item.module} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{item.module}</td>
                      {PERMISSION_FIELDS.map((f) => (
                        <td key={f.key} className="px-6 py-4 text-center">
                          <label className="inline-flex relative items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={item[f.key] === 1}
                              onChange={(e) => handleAccessChange(index, f.key, e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </td>
                      ))}
                    </tr>
                  ))}
                  {accessMatrix.length === 0 && (
                    <tr>
                      <td colSpan={PERMISSION_FIELDS.length + 1} className="px-6 py-8 text-center text-muted-foreground">
                        No modules available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/roles')}
            className="px-6 py-2.5 rounded-xl font-medium text-muted-foreground bg-secondary hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending || matrixLoading}
            className="px-6 py-2.5 rounded-xl font-medium text-white bg-primary hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {saveMutation.isPending ? 'Saving...' : (
              <>
                <Check className="w-5 h-5" />
                Save Access Matrix
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
