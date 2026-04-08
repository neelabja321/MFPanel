import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { loanService } from '@/services/loanService'
import { groupService } from '@/services/groupService'
import { customerService } from '@/services/customerService'
import PageHeader from '@/components/shared/PageHeader'
import FormLayout, { FormField, FormInput, FormSelect } from '@/components/shared/FormLayout'
import { useState } from 'react'

const schema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  groupId: z.string().min(1, 'Group is required'),
  amount: z.coerce.number().min(1000, 'Minimum loan amount is ₹1,000'),
  interestRate: z.coerce.number().min(1).max(36),
  durationMonths: z.coerce.number().min(1).max(60),
  purpose: z.string().min(5, 'Purpose is required'),
  dueDate: z.string().min(1),
  status: z.string().default('running'),
})

export default function LoanCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedGroup, setSelectedGroup] = useState('')

  const { data: groups = [] } = useQuery({
    queryKey: ['groups-options'],
    queryFn: () => groupService.getAllOptions(),
  })

  const { data: allCustomers = [] } = useQuery({
    queryKey: ['customers-all'],
    queryFn: () => customerService.getAll(),
  })

  const filteredCustomers = selectedGroup
    ? allCustomers.filter((c) => c.groupId === selectedGroup)
    : allCustomers

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'running',
      interestRate: 12,
      durationMonths: 12,
      dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  })

  const mutation = useMutation({
    mutationFn: loanService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      navigate('/loans')
    },
  })

  return (
    <div className="animate-fade-in">
      <PageHeader title="Add Loan" description="Disburse a new loan" backTo="/loans" />
      <FormLayout
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        loading={mutation.isPending}
        backTo="/loans"
        submitLabel="Disburse Loan"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <FormField label="Loan Amount (₹)" error={errors.amount?.message} required>
            <FormInput type="number" {...register('amount')} placeholder="e.g. 25000" error={errors.amount} />
          </FormField>
          <FormField label="Interest Rate (%)" error={errors.interestRate?.message} required>
            <FormInput type="number" step="0.5" {...register('interestRate')} error={errors.interestRate} />
          </FormField>
          <FormField label="Duration (Months)" error={errors.durationMonths?.message} required>
            <FormInput type="number" {...register('durationMonths')} error={errors.durationMonths} />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Due Date" error={errors.dueDate?.message} required>
            <FormInput type="date" {...register('dueDate')} error={errors.dueDate} />
          </FormField>
          <FormField label="Status">
            <FormSelect {...register('status')}>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
            </FormSelect>
          </FormField>
        </div>
        <FormField label="Purpose of Loan" error={errors.purpose?.message} required>
          <FormInput {...register('purpose')} placeholder="e.g. Dairy business - buffalo purchase" error={errors.purpose} />
        </FormField>
      </FormLayout>
    </div>
  )
}
