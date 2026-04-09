import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { userService } from '@/services/userService'
import PageHeader from '@/components/shared/PageHeader'
import FormLayout, { FormField, FormInput, FormSelect } from '@/components/shared/FormLayout'
import { FormSkeleton } from '@/components/shared/SkeletonLoaders'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  role: z.enum(['admin', 'manager', 'staff']),
  status: z.enum(['active', 'inactive']),
})

export default function UserEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      })
    }
  }, [user, reset])

  const mutation = useMutation({
    mutationFn: (data) => userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', id] })
      navigate('/users')
    },
  })

  const onSubmit = (data) => mutation.mutate(data)

  if (isLoading) return <FormSkeleton />

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">User not found</p>
        <button onClick={() => navigate('/users')} className="mt-4 text-primary underline">Back to Users</button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Edit User" description={`Updating details for ${user.name}`} />
      <FormLayout onSubmit={handleSubmit(onSubmit)} loading={mutation.isPending} onCancel={() => navigate('/users')} submitLabel="Update User" backTo="/users">
        <FormField label="Full Name" error={errors.name?.message} required>
          <FormInput {...register('name')} error={errors.name} />
        </FormField>
        <FormField label="Email Address" error={errors.email?.message} required>
          <FormInput type="email" {...register('email')} error={errors.email} />
        </FormField>
        <FormField label="Role" error={errors.role?.message} required>
          <FormSelect {...register('role')} error={errors.role}>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </FormSelect>
        </FormField>
        <FormField label="Status" error={errors.status?.message} required>
          <FormSelect {...register('status')} error={errors.status}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </FormSelect>
        </FormField>
      </FormLayout>
    </div>
  )
}
