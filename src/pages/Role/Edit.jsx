import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Check, ArrowLeft, Shield } from 'lucide-react'
import { roleService } from '@/services/roleService'
import PageHeader from '@/components/shared/PageHeader'

export default function RoleEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [roleName, setRoleName] = useState('')
  const [status, setStatus] = useState(1)
  const [accessMatrix, setAccessMatrix] = useState([])

  const { data: roleData, isLoading } = useQuery({
    queryKey: ['role', id],
    queryFn: () => roleService.getById(id),
    enabled: !!id,
  })

  useEffect(() => {
    if (roleData) {
      if (roleData.role) {
        setRoleName(roleData.role.role || '')
        setStatus(roleData.role.status !== undefined ? roleData.role.status : 1)
      }
      if (roleData.access) {
        setAccessMatrix(roleData.access)
      }
    }
  }, [roleData])

  const updateMutation = useMutation({
    mutationFn: (data) => roleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      queryClient.invalidateQueries({ queryKey: ['role', id] })
      navigate('/roles')
    },
    onError: (err) => {
      alert('Failed to update role: ' + (err.response?.data?.message || err.message))
    }
  })

  const handleAccessChange = (index, field, value) => {
    const updated = [...accessMatrix]
    updated[index][field] = value ? 1 : 0
    setAccessMatrix(updated)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // As per the example, update API expects { "access": [...] }
    // but typically we might also pass role and status. 
    // The given sample for PUT just has "access": [...]
    updateMutation.mutate({
      access: accessMatrix,
      // Optional if required by real backend:
      // role: roleName,
      // status: status
    })
  }

  if (isLoading) {
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
          <p className="text-muted-foreground mt-1">Update role privileges and access matrix</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Role Properties
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role Name</label>
              <input
                type="text"
                disabled
                className="w-full rounded-xl border border-input bg-muted px-4 py-2.5 outline-none text-muted-foreground font-medium cursor-not-allowed"
                value={roleName}
                title="Role Name cannot be changed here"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
                value={status}
                onChange={(e) => setStatus(Number(e.target.value))}
                disabled // assuming we can't change status via PUT access-matrix/role/{id}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
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
                  <th className="px-6 py-3 font-semibold text-muted-foreground text-center">Total Access</th>
                  <th className="px-6 py-3 font-semibold text-muted-foreground text-center">List</th>
                  <th className="px-6 py-3 font-semibold text-muted-foreground text-center">Create</th>
                  <th className="px-6 py-3 font-semibold text-muted-foreground text-center">Edit</th>
                  <th className="px-6 py-3 font-semibold text-muted-foreground text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {accessMatrix.map((item, index) => (
                  <tr key={item.module} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{item.module}</td>
                    {[
                      'total_access',
                      'list',
                      'create_records',
                      'edit_records',
                      'delete_records'
                    ].map(field => (
                      <td key={field} className="px-6 py-4 text-center">
                        <label className="inline-flex relative items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={item[field] === 1}
                            onChange={(e) => handleAccessChange(index, field, e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
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
                Update Role Access
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
