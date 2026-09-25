import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { userService } from '@/services/userService'
import { useRoleOptions } from '@/hooks/useRoleOptions'
import { getUserId, getUserRoleId, getUserRoleName } from '@/lib/accessControl'
import { useAuthStore } from '@/store'
import PageHeader from '@/components/shared/PageHeader'
import FormLayout, { FormField, FormInput, FormSelect } from '@/components/shared/FormLayout'
import { FormSkeleton } from '@/components/shared/SkeletonLoaders'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  mobile: z.string().min(10, 'Valid mobile required'),
  roleId: z.coerce.number().min(1, 'Role is required'),
  isAdmin: z.coerce.number(),
  branch_id: z.coerce.number(),
})

export default function UserEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const signedInUser = useAuthStore((state) => state.user)
  const updateAuthUser = useAuthStore((state) => state.updateAuthUser)

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id),
  })
  const { roles, isLoading: rolesLoading, isError: rolesError, refetch: refetchRoles } = useRoleOptions()
  const currentRoleId = getUserRoleId(user)
  const currentRoleName = getUserRoleName(user)

  const selectableRoles = useMemo(() => {
    const available = roles.filter((role) => role.status === 1 || role.id === currentRoleId)
    if (currentRoleId && !available.some((role) => role.id === currentRoleId)) {
      available.push({ id: currentRoleId, label: currentRoleName || `Role #${currentRoleId}`, status: 2 })
    }
    return available
  }, [roles, currentRoleId, currentRoleName])

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!user) return
    reset({
      name: user.name,
      email: user.email,
      mobile: user.mobile || '',
      roleId: getUserRoleId(user) ?? '',
      isAdmin: user.isAdmin ?? 2,
      branch_id: user.branch_id ?? 0,
    })
  }, [user, reset])

  const mutation = useMutation({
    mutationFn: (data) => userService.update(id, data),
    onSuccess: (_response, submittedData) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', id] })
      if (Number(id) === Number(getUserId(signedInUser))) updateAuthUser(submittedData)
      navigate('/users')
    },
  })

  const onSubmit = (data) => mutation.mutate(data)

  if (userLoading) return <FormSkeleton />
  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">User not found</p>
        <button type="button" onClick={() => navigate('/users')} className="mt-4 text-primary underline">
          Back to Users
        </button>
      </div>
    )
  }

  const roleSelectionUnavailable = rolesLoading || rolesError || selectableRoles.length === 0

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Edit User" description={`Updating details for ${user.name}`} />
      <FormLayout
        onSubmit={handleSubmit(onSubmit)}
        loading={mutation.isPending}
        disabled={roleSelectionUnavailable}
        submitLabel="Update User"
        backTo="/users"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Full Name" error={errors.name?.message} required>
            <FormInput {...register('name')} error={errors.name} />
          </FormField>
          <FormField label="Email Address" error={errors.email?.message} required>
            <FormInput type="email" {...register('email')} error={errors.email} />
          </FormField>
          <FormField label="Mobile" error={errors.mobile?.message} required>
            <FormInput type="text" {...register('mobile')} error={errors.mobile} />
          </FormField>
        </div>

        <hr className="my-6 border-slate-200" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            label="Role"
            error={errors.roleId?.message}
            hint="Active roles come from the role access-matrix configuration."
            required
          >
            <FormSelect
              {...register('roleId')}
              error={errors.roleId}
              disabled={roleSelectionUnavailable}
            >
              <option value="">{rolesLoading ? 'Loading roles...' : 'Select a role'}</option>
              {selectableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}{role.status !== 1 ? ' (Inactive)' : ''}
                </option>
              ))}
            </FormSelect>
          </FormField>

          <FormField label="Access Level (Is Admin)" error={errors.isAdmin?.message}>
            <FormSelect {...register('isAdmin')} error={errors.isAdmin}>
              <option value="1">Admin (Level 1)</option>
              <option value="2">Non-Admin (Level 2)</option>
              <option value="0">Basic Access (Level 0)</option>
            </FormSelect>
          </FormField>

          <FormField label="Branch" error={errors.branch_id?.message}>
            <FormSelect {...register('branch_id')} error={errors.branch_id}>
              <option value="0">Main Branch (0)</option>
              <option value="1">Branch 1</option>
            </FormSelect>
          </FormField>
        </div>

        {rolesError && (
          <div className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-lg text-sm">
            Roles could not be loaded.{' '}
            <button type="button" onClick={() => refetchRoles()} className="font-semibold underline">
              Retry
            </button>
          </div>
        )}
        {mutation.isError && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {mutation.error?.response?.data?.message || mutation.error?.message || 'Failed to update user.'}
          </div>
        )}
      </FormLayout>
    </div>
  )
}
