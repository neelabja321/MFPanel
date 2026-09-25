import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  ShieldCheck,
  Pencil,
  SlidersHorizontal,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react'
import { roleService } from '@/services/roleService'
import AccessMatrixTable from '@/components/shared/AccessMatrixTable'
import {
  validateAccessMatrix,
  extractRole,
  countEnabledModules,
} from '@/lib/accessMatrix'
import { formatDate, getApiError } from '@/lib/utils'
import { useAuthStore } from '@/store'
import { canAccess, MODULES, PERMISSIONS } from '@/lib/accessControl'

export default function RoleView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const permissions = useAuthStore((state) => state.permissions)
  const mayEdit = canAccess(permissions, MODULES.ADMINISTRATOR, PERMISSIONS.EDIT)

  const {
    data: matrixData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: refetchMatrix,
  } = useQuery({
    queryKey: ['role-access', id],
    queryFn: () => roleService.getAccessMatrix(id),
    enabled: !!id,
    retry: false,
  })

  const { data: roleRecord } = useQuery({
    queryKey: ['role', id],
    queryFn: () => roleService.getById(id),
    enabled: !!id,
  })

  const accessMatrix = validateAccessMatrix(matrixData) ?? []
  const matrixUnavailable = !isLoading && (isError || accessMatrix.length === 0)
  const usingLocalCache = matrixData?._matrixSource === 'local-cache'
  const role = extractRole(matrixData) ?? roleRecord
  const roleName = role?.role ?? `#${id}`
  const isActive = Number(role?.status) === 1
  const enabledCount = countEnabledModules(accessMatrix)
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
            {roleName}
          </h1>
          <p className="text-muted-foreground mt-1">Role details and module permissions</p>
        </div>
        {mayEdit && (
          <div className="flex items-center gap-2">
          <Link
            to={`/roles/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit Role
          </Link>
          <Link
            to={`/roles/${id}/access`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Edit Access Matrix
          </Link>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Role Properties
        </h3>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <dt className="text-muted-foreground">Role ID</dt>
            <dd className="mt-1 font-medium text-foreground">{role?.roleId ?? id}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Role Name</dt>
            <dd className="mt-1 font-medium text-foreground">{role?.role ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Level</dt>
            <dd className="mt-1 font-medium text-foreground">{role?.level ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="mt-1">
              <span
                className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${
                  isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </dd>
          </div>
          {role?.createdDtm && (
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd className="mt-1 font-medium text-foreground">{formatDate(role.createdDtm)}</dd>
            </div>
          )}
        </dl>
      </div>

      {usingLocalCache && (
        <div className="flex gap-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl px-5 py-4 text-sm">
          <TriangleAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Showing the last successfully saved matrix from this browser</p>
            <p className="mt-1 text-amber-800">
              The server read endpoint is currently unavailable. Use Retry to check it again.
            </p>
          </div>
        </div>
      )}

      {matrixUnavailable ? (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold">Access matrix unavailable</h3>
          <p className="text-sm mt-1">
            {matrixError.message || 'No previously saved matrix is available in this browser.'}
          </p>
          <button
            type="button"
            onClick={() => refetchMatrix()}
            disabled={isFetching}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-red-200 hover:bg-red-100 disabled:opacity-60 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 pb-4 border-b border-border flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Module Permissions Matrix
            </h3>
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              {enabledCount} of {accessMatrix.length} modules enabled
            </span>
          </div>
          <AccessMatrixTable rows={accessMatrix} loading={isLoading} readOnly />
        </div>
      )}
    </div>
  )
}
