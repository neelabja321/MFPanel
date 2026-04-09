import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { userService } from '@/services/userService'
import PageHeader from '@/components/shared/PageHeader'
import FormLayout, { FormField, FormInput, FormSelect } from '@/components/shared/FormLayout'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  role: z.enum(['admin', 'manager', 'staff']),
  status: z.enum(['active', 'inactive']).default('active'),
})

export default function UserCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active', role: 'staff' },
  })

  const mutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      navigate('/users')
    },
  })

  const onSubmit = (data) => mutation.mutate(data)

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Add User" description="Create a new staff account" />
      <FormLayout onSubmit={handleSubmit(onSubmit)} loading={mutation.isPending} onCancel={() => navigate('/users')} submitLabel="Create User" backTo="/users">
        <FormField label="Full Name" error={errors.name?.message} required>
          <FormInput {...register('name')} placeholder="e.g. John Doe" error={errors.name} />
        </FormField>
        <FormField label="Email Address" error={errors.email?.message} required>
          <FormInput type="email" {...register('email')} placeholder="john@example.com" error={errors.email} />
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
