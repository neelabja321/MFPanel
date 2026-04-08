import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { savingsService } from '@/services/savingsService'
import { customerService } from '@/services/customerService'
import { groupService } from '@/services/groupService'
import PageHeader from '@/components/shared/PageHeader'
import FormLayout, { FormField, FormSelect } from '@/components/shared/FormLayout'
import { useState } from 'react'

const schema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  groupId: z.string().min(1, 'Group is required'),
})

export default function SavingsCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedGroup, setSelectedGroup] = useState('')

  const { data: groups = [] } = useQuery({ queryKey: ['groups-options'], queryFn: () => groupService.getAllOptions() })
  const { data: allCustomers = [] } = useQuery({ queryKey: ['customers-all'], queryFn: () => customerService.getAll() })
  const filteredCustomers = selectedGroup ? allCustomers.filter((c) => c.groupId === selectedGroup) : allCustomers

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: savingsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] })
      navigate('/savings')
    },
  })

  return (
    <div className="animate-fade-in">
      <PageHeader title="Open Savings Account" description="Create a savings account for a member" backTo="/savings" />
      <FormLayout
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        loading={mutation.isPending}
        backTo="/savings"
        submitLabel="Open Account"
      >
        <FormField label="Group" error={errors.groupId?.message} required>
          <FormSelect
            {...register('groupId')}
            onChange={(e) => {
              setValue('groupId', e.target.value)
              setValue('customerId', '')
              setSelectedGroup(e.target.value)
            }}
            error={errors.groupId}
          >
            <option value="">Select group</option>
            {groups.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </FormSelect>
        </FormField>
        <FormField label="Customer" error={errors.customerId?.message} required>
          <FormSelect {...register('customerId')} error={errors.customerId}>
            <option value="">Select customer</option>
            {filteredCustomers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </FormSelect>
        </FormField>
        {mutation.isError && <p className="text-sm text-destructive">{mutation.error?.message}</p>}
      </FormLayout>
    </div>
  )
}
