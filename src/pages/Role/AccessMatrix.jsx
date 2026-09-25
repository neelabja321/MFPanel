import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Check, ArrowLeft, ShieldCheck, Eye, RefreshCw, TriangleAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import { roleService } from '@/services/roleService'
import AccessMatrixTable from '@/components/shared/AccessMatrixTable'
import {
  validateAccessMatrix,
  extractRole,
  applyPermissionChange,
  setModuleAll,
  toAccessPayload,
  countEnabledModules,
} from '@/lib/accessMatrix'
import { getApiError } from '@/lib/utils'

export default function RoleAccessMatrix() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [accessMatrix, setAccessMatrix] = useState([])

  const {
    data: matrixData,
    isLoading: matrixLoading,
    isFetching: matrixFetching,
    isError,
    error,
    refetch: refetchMatrix,
  } = useQuery({
    queryKey: ['role-access', id],
    queryFn: () => roleService.getAccessMatrix(id),
    enabled: !!id,
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
    // Do not replace a form the administrator may currently be editing.
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const { data: roleRecord } = useQuery({
    queryKey: ['role', id],
    queryFn: () => roleService.getById(id),
    enabled: !!id,
  })

  const validatedMatrix = useMemo(() => validateAccessMatrix(matrixData), [matrixData])
  const matrixUnavailable = !matrixLoading && (isError || !validatedMatrix)
  const usingLocalCache = matrixData?._matrixSource === 'local-cache'
  const hasFreshBaseline = matrixData?._matrixSource === 'api' && !!validatedMatrix

  useEffect(() => {
    // Only a fresh, validated GET may become an editable baseline. A cached
    // snapshot is useful for viewing but unsafe for a full-replacement PUT.
    if (matrixData?._matrixSource === 'api' && validatedMatrix) {
      setAccessMatrix(validatedMatrix)
    }
  }, [matrixData, validatedMatrix])

  const saveMutation = useMutation({
    mutationFn: (access) => roleService.updateAccessMatrix(id, access),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-access', id] })
      toast.success('Access matrix updated successfully')
      navigate(`/roles/${id}`)
    },
    onError: (err) => {
      toast.error(`Failed to update access matrix: ${getApiError(err).message}`)
    },
  })

  const handleAccessChange = (index, field, checked) => {
    setAccessMatrix((previous) => applyPermissionChange(previous, index, field, checked))
  }

  const handleToggleModule = (index, granted) => {
    setAccessMatrix((previous) => setModuleAll(previous, index, granted))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!hasFreshBaseline || accessMatrix.length === 0) return
    saveMutation.mutate(toAccessPayload(accessMatrix))
  }

  const role = extractRole(matrixData) ?? roleRecord
  const roleName = role?.role ?? `#${id}`
  const enabledCount = countEnabledModules(hasFreshBaseline ? accessMatrix : validatedMatrix ?? [])
  const matrixError = getApiError(error)

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/roles')}
          className="p-2 hover:bg-muted rounded-xl transition-colors"
          aria-label="Back to roles"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Access Matrix: {roleName}
          </h1>
          <p className="text-muted-foreground mt-1">Configure module-level permissions for this role</p>
        </div>
        <Link
          to={`/roles/${id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <Eye className="w-4 h-4" />
          View
        </Link>
      </div>

      {matrixUnavailable ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold">Cannot safely edit this access matrix</h3>
          <p className="text-sm mt-1">
            {matrixError.message || 'No valid matrix is available.'} No permissions have been changed.
          </p>
          <p className="text-xs text-red-700 mt-2">
            Editing requires a fresh copy of the role's current permissions from the server.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => refetchMatrix()}
              disabled={matrixFetching}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-red-200 hover:bg-red-100 disabled:opacity-60 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${matrixFetching ? 'animate-spin' : ''}`} />
              {matrixFetching ? 'Retrying...' : 'Retry'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/roles')}
              className="px-4 py-2 rounded-xl text-sm font-medium text-red-800 hover:bg-red-100 transition-colors"
            >
              Back to roles
            </button>
          </div>
        </div>
      ) : usingLocalCache ? (
        <div className="space-y-6">
          <div className="flex gap-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl px-5 py-4 text-sm">
            <TriangleAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Showing the last successfully saved matrix from this browser</p>
              <p className="mt-1 text-amber-800">
                It is read-only because the server could not provide a fresh copy. Retry before editing
                to avoid overwriting newer permissions.
              </p>
              <button
                type="button"
                onClick={() => refetchMatrix()}
                disabled={matrixFetching}
                className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium bg-white border border-amber-300 hover:bg-amber-100 disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${matrixFetching ? 'animate-spin' : ''}`} />
                {matrixFetching ? 'Retrying...' : 'Retry server'}
              </button>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 pb-4 border-b border-border flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Module Permissions Matrix — Read Only
              </h3>
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                {enabledCount} of {validatedMatrix.length} modules enabled
              </span>
            </div>
            <AccessMatrixTable rows={validatedMatrix} readOnly />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 pb-4 border-b border-border flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Module Permissions Matrix
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Total Access is the module gate; disabling it clears the module's other permissions.
                </p>
              </div>
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                {enabledCount} of {accessMatrix.length} modules enabled
              </span>
            </div>
            <AccessMatrixTable
              rows={accessMatrix}
              onChange={handleAccessChange}
              onToggleModule={handleToggleModule}
              loading={matrixLoading}
            />
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
              disabled={saveMutation.isPending || !hasFreshBaseline || accessMatrix.length === 0}
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
      )}
    </div>
  )
}
