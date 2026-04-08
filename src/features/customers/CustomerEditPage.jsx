import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { customerService } from '@/services/customerService'
import { groupService } from '@/services/groupService'
import PageHeader from '@/components/shared/PageHeader'
import FormLayout, { FormField, FormInput, FormSelect } from '@/components/shared/FormLayout'
import { FormSkeleton } from '@/components/shared/SkeletonLoaders'

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  address: z.string().min(5),
  idProof: z.string().min(1),
  idNumber: z.string().min(3),
  groupId: z.string().min(1),
  status: z.string(),
})

export default function CustomerEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: groups = [] } = useQuery({
    queryKey: ['groups-options'],
    queryFn: () => groupService.getAllOptions(),
  })

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.getById(id),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: customer || {},
  })

  useEffect(() => {
    if (customer) {
      reset(customer)
    }
  }, [customer, reset])

  const mutation = useMutation({
    mutationFn: (data) => customerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      navigate('/customers')
    },
  })

  if (isLoading) return <FormSkeleton />

  return (
    <div className="animate-fade-in">
      <PageHeader title="Edit Customer" description={`Editing: ${customer?.name}`} backTo="/customers" />
      <FormLayout
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        loading={mutation.isPending}
        backTo="/customers"
        submitLabel="Update Customer"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Full Name" error={errors.name?.message} required>
            <FormInput {...register('name')} error={errors.name} />
          </FormField>
          <FormField label="Phone Number" error={errors.phone?.message} required>
            <FormInput {...register('phone')} error={errors.phone} />
          </FormField>
        </div>
        <FormField label="Address" error={errors.address?.message} required>
          <FormInput {...register('address')} error={errors.address} />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="ID Proof Type" error={errors.idProof?.message} required>
            <FormSelect {...register('idProof')} error={errors.idProof}>
              <option value="Aadhaar">Aadhaar Card</option>
              <option value="Voter ID">Voter ID</option>
              <option value="PAN Card">PAN Card</option>
              <option value="Ration Card">Ration Card</option>
            </FormSelect>
          </FormField>
          <FormField label="ID Number" error={errors.idNumber?.message} required>
            <FormInput {...register('idNumber')} error={errors.idNumber} />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Group" error={errors.groupId?.message} required>
            <FormSelect {...register('groupId')} error={errors.groupId}>
              {groups.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </FormSelect>
          </FormField>
          <FormField label="Status">
            <FormSelect {...register('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="defaulted">Defaulted</option>
            </FormSelect>
          </FormField>
        </div>
      </FormLayout>
    </div>
  )
}
