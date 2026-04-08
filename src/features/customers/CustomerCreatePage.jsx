import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { customerService } from '@/services/customerService'
import { groupService } from '@/services/groupService'
import PageHeader from '@/components/shared/PageHeader'
import FormLayout, { FormField, FormInput, FormSelect } from '@/components/shared/FormLayout'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  address: z.string().min(5, 'Address is required'),
  idProof: z.string().min(1, 'ID proof type is required'),
  idNumber: z.string().min(3, 'ID number is required'),
  groupId: z.string().min(1, 'Group is required'),
  status: z.string().default('active'),
})

export default function CustomerCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: groups = [] } = useQuery({
    queryKey: ['groups-options'],
    queryFn: () => groupService.getAllOptions(),
  })

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active' },
  })

  const mutation = useMutation({
    mutationFn: customerService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      navigate('/customers')
    },
  })

  return (
    <div className="animate-fade-in">
      <PageHeader title="Add Customer" description="Register a new customer" backTo="/customers" />
      <FormLayout
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        loading={mutation.isPending}
        backTo="/customers"
        submitLabel="Add Customer"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Full Name" error={errors.name?.message} required>
            <FormInput {...register('name')} placeholder="e.g. Sunita Devi" error={errors.name} />
          </FormField>
          <FormField label="Phone Number" error={errors.phone?.message} required>
            <FormInput {...register('phone')} placeholder="10-digit mobile number" error={errors.phone} />
          </FormField>
        </div>
        <FormField label="Address" error={errors.address?.message} required>
          <FormInput {...register('address')} placeholder="Village/Town, District, State - PIN" error={errors.address} />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="ID Proof Type" error={errors.idProof?.message} required>
            <FormSelect {...register('idProof')} error={errors.idProof}>
              <option value="">Select ID type</option>
              <option value="Aadhaar">Aadhaar Card</option>
              <option value="Voter ID">Voter ID</option>
              <option value="PAN Card">PAN Card</option>
              <option value="Ration Card">Ration Card</option>
            </FormSelect>
          </FormField>
          <FormField label="ID Number" error={errors.idNumber?.message} required>
            <FormInput {...register('idNumber')} placeholder="ID document number" error={errors.idNumber} />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Group" error={errors.groupId?.message} required>
            <FormSelect {...register('groupId')} error={errors.groupId}>
              <option value="">Select a group</option>
              {groups.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </FormSelect>
          </FormField>
          <FormField label="Status" error={errors.status?.message}>
            <FormSelect {...register('status')} error={errors.status}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </FormSelect>
          </FormField>
        </div>
        {mutation.isError && (
          <p className="text-sm text-destructive">{mutation.error?.message}</p>
        )}
      </FormLayout>
    </div>
  )
}
