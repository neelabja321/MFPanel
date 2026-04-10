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
  password: z.string().min(6, 'Password is required (min 6 chars)'),
  mobile: z.string().min(10, 'Valid mobile required'),
  roleId: z.coerce.number().min(1, 'Role is required'),
  isAdmin: z.coerce.number(),
  branch_id: z.coerce.number(),
})

export default function UserCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { isAdmin: 2, roleId: 3, branch_id: 1 },
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
        
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Full Name" error={errors.name?.message} required>
            <FormInput {...register('name')} placeholder="e.g. John Doe" error={errors.name} />
          </FormField>
          
          <FormField label="Email Address" error={errors.email?.message} required>
            <FormInput type="email" {...register('email')} placeholder="john@example.com" error={errors.email} />
          </FormField>

          <FormField label="Password" error={errors.password?.message} required>
            <FormInput type="password" {...register('password')} placeholder="••••••••" error={errors.password} />
          </FormField>

          <FormField label="Mobile" error={errors.mobile?.message} required>
            <FormInput type="text" {...register('mobile')} placeholder="9876543210" error={errors.mobile} />
          </FormField>
        </div>

        <hr className="my-6 border-slate-200" />

        {/* Roles & Permissions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Role" error={errors.roleId?.message} required>
            <FormSelect {...register('roleId')} error={errors.roleId}>
              <option value="1">System Administrator</option>
              <option value="2">Manager</option>
              <option value="3">Employee</option>
              <option value="12">Data Entry Operator</option>
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
        
        {mutation.isError && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {mutation.error?.response?.data?.errors 
              ? Object.values(mutation.error.response.data.errors).flat().join(', ') 
              : (mutation.error?.response?.data?.message || mutation.error?.message || "Failed to create user.")}
          </div>
        )}
      </FormLayout>
    </div>
  )
}
