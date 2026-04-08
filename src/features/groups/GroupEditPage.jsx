import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { groupService } from '@/services/groupService'
import PageHeader from '@/components/shared/PageHeader'
import FormLayout, { FormField, FormInput, FormSelect } from '@/components/shared/FormLayout'
import { FormSkeleton } from '@/components/shared/SkeletonLoaders'

const schema = z.object({
  name: z.string().min(3),
  location: z.string().min(3),
  leader: z.string().min(2),
  leaderPhone: z.string().regex(/^\d{10}$/),
  meetingDay: z.string().min(1),
  formedDate: z.string().min(1),
  status: z.string(),
})

export default function GroupEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: group, isLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: () => groupService.getById(id),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: group || {},
  })

  useEffect(() => {
    if (group) {
      reset(group)
    }
  }, [group, reset])

  const mutation = useMutation({
    mutationFn: (data) => groupService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      navigate('/groups')
    },
  })

  if (isLoading) return <FormSkeleton />

  return (
    <div className="animate-fade-in">
      <PageHeader title="Edit Group" description={`Editing: ${group?.name}`} backTo="/groups" />
      <FormLayout
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        loading={mutation.isPending}
        backTo="/groups"
        submitLabel="Update Group"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Group Name" error={errors.name?.message} required>
            <FormInput {...register('name')} error={errors.name} />
          </FormField>
          <FormField label="Location" error={errors.location?.message} required>
            <FormInput {...register('location')} error={errors.location} />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Leader Name" error={errors.leader?.message} required>
            <FormInput {...register('leader')} error={errors.leader} />
          </FormField>
          <FormField label="Leader Phone" error={errors.leaderPhone?.message} required>
            <FormInput {...register('leaderPhone')} error={errors.leaderPhone} />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <FormField label="Meeting Day">
            <FormSelect {...register('meetingDay')}>
              {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </FormSelect>
          </FormField>
          <FormField label="Formed Date">
            <FormInput type="date" {...register('formedDate')} />
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
