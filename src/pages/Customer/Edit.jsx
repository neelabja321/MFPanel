import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { customerService } from '@/services/customerService'
import PageHeader from '@/components/shared/PageHeader'
import FormLayout, { FormField, FormInput, FormSelect } from '@/components/shared/FormLayout'
import { FormSkeleton } from '@/components/shared/SkeletonLoaders'

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  gender: z.enum(['Male', 'Female', 'Other'], { errorMap: () => ({ message: 'Please select a gender' }) }),
  date_of_birth: z.string().optional().or(z.literal('')),
  phone_number: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  email: z.string().email('Invalid email address'),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits').optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  id_proof_type: z.enum(['PAN', 'Aadhaar', 'Passport', 'Driving License'], { errorMap: () => ({ message: 'Select ID proof' }) }).optional().or(z.literal('')),
  id_proof_number: z.string().optional().or(z.literal('')),
  occupation: z.string().optional().or(z.literal('')),
  annual_income: z.preprocess((val) => (val === '' || val == null ? undefined : Number(val)), z.number({ invalid_type_error: 'Annual income must be a number' }).optional())
})

export default function CustomerEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: customerResponse, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.getCustomerById(id),
  })

  const customer = customerResponse?.data

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: customer || {},
  })

  useEffect(() => {
    if (customer) {
      // Normalize nulls into empty strings so inputs don't become uncontrolled
      const normalizedData = Object.fromEntries(
        Object.entries(customer).map(([k, v]) => [k, v === null ? '' : v])
      )
      // Format date if needed, assuming API returns YYYY-MM-DD
      if (normalizedData.date_of_birth && normalizedData.date_of_birth.includes('T')) {
         normalizedData.date_of_birth = normalizedData.date_of_birth.split('T')[0]
      }
      reset(normalizedData)
    }
  }, [customer, reset])

  const mutation = useMutation({
    mutationFn: (data) => customerService.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customer', id] })
      toast.success('Customer updated successfully')
      navigate('/customers')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to update customer')
    }
  })

  if (isLoading) return <FormSkeleton />

  return (
    <div className="animate-fade-in">
      <PageHeader title="Edit Customer" description={`Editing customer ID: ${id}`} backTo="/customers" />
      <FormLayout
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        loading={mutation.isPending}
        backTo="/customers"
        submitLabel="Update Customer"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Full Name" error={errors.full_name?.message} required>
            <FormInput {...register('full_name')} placeholder="e.g. John Doe" error={errors.full_name} />
          </FormField>
          <FormField label="Email" error={errors.email?.message} required>
            <FormInput {...register('email')} type="email" placeholder="john@example.com" error={errors.email} />
          </FormField>
          
          <FormField label="Phone Number" error={errors.phone_number?.message} required>
            <FormInput {...register('phone_number')} placeholder="10-digit mobile number" error={errors.phone_number} />
          </FormField>
          <FormField label="Gender" error={errors.gender?.message}>
            <FormSelect {...register('gender')} error={errors.gender}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </FormSelect>
          </FormField>

          <FormField label="Date of Birth" error={errors.date_of_birth?.message}>
            <FormInput {...register('date_of_birth')} type="date" error={errors.date_of_birth} />
          </FormField>
          <FormField label="Occupation" error={errors.occupation?.message}>
            <FormInput {...register('occupation')} placeholder="e.g. Software Engineer" error={errors.occupation} />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="ID Proof Type" error={errors.id_proof_type?.message}>
            <FormSelect {...register('id_proof_type')} error={errors.id_proof_type}>
              <option value="">Select ID type</option>
              <option value="PAN">PAN</option>
              <option value="Aadhaar">Aadhaar</option>
              <option value="Passport">Passport</option>
              <option value="Driving License">Driving License</option>
            </FormSelect>
          </FormField>
          <FormField label="ID Proof Number" error={errors.id_proof_number?.message}>
            <FormInput {...register('id_proof_number')} placeholder="ID document number" error={errors.id_proof_number} />
          </FormField>
        </div>

        <FormField label="Address" error={errors.address?.message}>
          <FormInput {...register('address')} placeholder="Street, Apartment, etc." error={errors.address} />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="City" error={errors.city?.message}>
            <FormInput {...register('city')} placeholder="City" error={errors.city} />
          </FormField>
          <FormField label="State" error={errors.state?.message}>
            <FormInput {...register('state')} placeholder="State" error={errors.state} />
          </FormField>
          
          <FormField label="Pincode" error={errors.pincode?.message}>
            <FormInput {...register('pincode')} placeholder="6-digit pincode" error={errors.pincode} />
          </FormField>
          <FormField label="Country" error={errors.country?.message}>
            <FormInput {...register('country')} placeholder="Country" error={errors.country} />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Annual Income" error={errors.annual_income?.message}>
            <FormInput {...register('annual_income')} type="number" placeholder="e.g. 1800000" error={errors.annual_income} />
          </FormField>
        </div>
      </FormLayout>
    </div>
  )
}
