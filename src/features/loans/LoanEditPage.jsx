import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { loanService } from '@/services/loanService'
import PageHeader from '@/components/shared/PageHeader'
import FormLayout, { FormField, FormInput, FormSelect } from '@/components/shared/FormLayout'
import { FormSkeleton } from '@/components/shared/SkeletonLoaders'

const schema = z.object({
  amount: z.coerce.number().min(1000),
  interestRate: z.coerce.number().min(1).max(36),
  durationMonths: z.coerce.number().min(1).max(60),
  purpose: z.string().min(5),
  status: z.string(),
  paidEmis: z.coerce.number().min(0),
})

export default function LoanEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: loan, isLoading } = useQuery({
    queryKey: ['loan', id],
    queryFn: () => loanService.getById(id),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: loan || {},
  })

  useEffect(() => {
    if (loan) {
      reset(loan)
    }
  }, [loan, reset])

  const mutation = useMutation({
    mutationFn: (data) => loanService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
      navigate('/loans')
    },
  })

  if (isLoading) return <FormSkeleton />

  return (
    <div className="animate-fade-in">
      <PageHeader title="Edit Loan" description={`Loan ID: ${id}`} backTo="/loans" />
      <FormLayout
        onSubmit={handleSubmit((d) => mutation.mutate(d))}
        loading={mutation.isPending}
        backTo="/loans"
        submitLabel="Update Loan"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <FormField label="Loan Amount (₹)" error={errors.amount?.message} required>
            <FormInput type="number" {...register('amount')} error={errors.amount} />
          </FormField>
          <FormField label="Interest Rate (%)" error={errors.interestRate?.message} required>
            <FormInput type="number" step="0.5" {...register('interestRate')} error={errors.interestRate} />
          </FormField>
          <FormField label="Duration (Months)" error={errors.durationMonths?.message} required>
            <FormInput type="number" {...register('durationMonths')} error={errors.durationMonths} />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="EMIs Paid" error={errors.paidEmis?.message}>
            <FormInput type="number" {...register('paidEmis')} error={errors.paidEmis} />
          </FormField>
          <FormField label="Status">
            <FormSelect {...register('status')}>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="defaulted">Defaulted</option>
            </FormSelect>
          </FormField>
        </div>
        <FormField label="Purpose" error={errors.purpose?.message} required>
          <FormInput {...register('purpose')} error={errors.purpose} />
        </FormField>
      </FormLayout>
    </div>
  )
}
