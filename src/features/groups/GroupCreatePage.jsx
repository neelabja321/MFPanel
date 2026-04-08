import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { groupService } from '@/services/groupService'
import PageHeader from '@/components/shared/PageHeader'
import FormLayout, { FormField, FormInput, FormSelect } from '@/components/shared/FormLayout'

const schema = z.object({
  name: z.string().min(3, 'Group name is required'),
  location: z.string().min(3, 'Location is required'),
  leader: z.string().min(2, 'Leader name is required'),
  leaderPhone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  meetingDay: z.string().min(1, 'Select a meeting day'),
  formedDate: z.string().min(1, 'Date is required'),
  status: z.string().default('active'),
})

export default function GroupCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { status: 'active', formedDate: new Date().toISOString().split('T')[0] },
  })

  const mutation = useMutation({
    mutationFn: groupService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      navigate('/groups')
    },
  })

  return (
    <div className="animate-fade-in">
      <PageHeader title="Add Group" description="Create a new self-help group" backTo="/groups" />
      <FormLayout
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        loading={mutation.isPending}
        backTo="/groups"
        submitLabel="Create Group"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Group Name" error={errors.name?.message} required>
            <FormInput {...register('name')} placeholder="e.g. Sunrise Women Group" error={errors.name} />
          </FormField>
          <FormField label="Location" error={errors.location?.message} required>
            <FormInput {...register('location')} placeholder="Village/Town, District" error={errors.location} />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Leader Name" error={errors.leader?.message} required>
            <FormInput {...register('leader')} placeholder="Leader full name" error={errors.leader} />
          </FormField>
          <FormField label="Leader Phone" error={errors.leaderPhone?.message} required>
            <FormInput {...register('leaderPhone')} placeholder="10-digit mobile" error={errors.leaderPhone} />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <FormField label="Meeting Day" error={errors.meetingDay?.message} required>
            <FormSelect {...register('meetingDay')} error={errors.meetingDay}>
              <option value="">Select day</option>
              {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </FormSelect>
          </FormField>
          <FormField label="Formed Date" error={errors.formedDate?.message} required>
            <FormInput type="date" {...register('formedDate')} error={errors.formedDate} />
          </FormField>
          <FormField label="Status">
            <FormSelect {...register('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </FormSelect>
          </FormField>
        </div>
      </FormLayout>
    </div>
  )
}
