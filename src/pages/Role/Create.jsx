import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, ArrowLeft, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { roleService } from '@/services/roleService'

export default function RoleCreate() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [roleName, setRoleName] = useState('')
  const [level, setLevel] = useState(1)
  const [status, setStatus] = useState(1)

  const createMutation = useMutation({
    mutationFn: roleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Role created successfully')
      navigate('/roles')
    },
    onError: (err) => {
      toast.error('Failed to create role: ' + (err.response?.data?.message || err.message))
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!roleName.trim()) return toast.error('Role name is required')

    createMutation.mutate({
      role: roleName.trim(),
      level: Number(level),
      status: Number(status),
    })
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
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
            Create Role
          </h1>
          <p className="text-muted-foreground mt-1">Define a new system role</p>
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
            disabled={createMutation.isPending}
            className="px-6 py-2.5 rounded-xl font-medium text-white bg-primary hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            {createMutation.isPending ? 'Saving...' : (
              <>
                <Check className="w-5 h-5" />
                Save New Role
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
