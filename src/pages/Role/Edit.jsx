import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Check, ArrowLeft, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { roleService } from '@/services/roleService'

const PERMISSION_FIELDS = [
  { key: 'total_access', label: 'Total Access' },
  { key: 'list', label: 'List' },
  { key: 'create_records', label: 'Create' },
  { key: 'edit_records', label: 'Edit' },
  { key: 'delete_records', label: 'Delete' },
]

// Normalize any module row into the exact shape the API expects.
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

export default function RoleEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [roleName, setRoleName] = useState('')
  const [level, setLevel] = useState(1)
  const [status, setStatus] = useState(1)
  const [accessMatrix, setAccessMatrix] = useState([])

  // Basic role record (name / level / status).
  const { data: roleData, isLoading: roleLoading } = useQuery({
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
    if (roleData) {
      setRoleName(roleData.role ?? '')
      setLevel(roleData.level ?? 1)
      setStatus(roleData.status ?? 1)
    }
  }, [roleData])

  useEffect(() => {
    // Prefer the role's saved access matrix; fall back to the default structure.
    const source = matrixData?.access ?? (Array.isArray(matrixData) ? matrixData : null) ?? defaultModules
    if (Array.isArray(source) && source.length) {
      setAccessMatrix(source.map(normalizeModule))
    }
  }, [matrixData, defaultModules])

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      // Two concerns, two endpoints: role record + access matrix.
      await roleService.update(id, {
        role: payload.role,
        level: payload.level,
        status: payload.status,
      })
      await roleService.updateAccessMatrix(id, payload.access)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['role', id] })
      queryClient.invalidateQueries({ queryKey: ['role-access', id] })
      toast.success('Role updated successfully')
      navigate('/roles')
    },
    onError: (err) => {
      toast.error('Failed to update role: ' + (err.response?.data?.message || err.message))
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
    if (!roleName.trim()) return toast.error('Role name is required')

    updateMutation.mutate({
      role: roleName.trim(),
      level: Number(level),
      status: Number(status),
      access: accessMatrix.map(normalizeModule),
    })
  }

  if (roleLoading || matrixLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Role Data...</div>
  }

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
            <Shield className="w-6 h-6 text-primary" />
            Edit Role: {roleName}
          </h1>
          <p className="text-muted-foreground mt-1">Update role properties and access matrix</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Role Properties
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 md:col-span-1">
              <label className="text-sm font-medium">Role Name</label>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g. Loan Officer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Level</label>
              <select
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((l) => (
                  <option key={l} value={l}>Level {l}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
                value={status}
                onChange={(e) => setStatus(Number(e.target.value))}
              >
                <option value={1}>Active</option>
                <option value={2}>Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 pb-4 border-b border-border">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Module Permissions Matrix
            </h3>
          </div>

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
            disabled={updateMutation.isPending}
            className="px-6 py-2.5 rounded-xl font-medium text-white bg-primary hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            {updateMutation.isPending ? 'Updating...' : (
              <>
                <Check className="w-5 h-5" />
                Update Role
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
