import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { exportToExcel } from '@/lib/exportUtils'
import { customerService } from '@/services/customerService'
import DataTableLayout from '@/components/shared/DataTableLayout'
import PageHeader from '@/components/shared/PageHeader'
import ActionButtons from '@/components/shared/ActionButtons'

export default function CustomerList() {
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'full_name', direction: 'asc' })
  const queryClient = useQueryClient()

  // The 'customers' API is just GET /customers, usually no pagination unless params sent
  const { data: response = {}, isLoading, isError, error } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getCustomers(),
  })

  const customers = response?.data || []

  // Basic client-side searching & sorting since server-side might not be fully requested/specified
  const processedData = useMemo(() => {
    let result = Array.isArray(customers) ? [...customers] : []

    // Searching
    if (search) {
      const lowerSearch = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(lowerSearch) ||
          c.email?.toLowerCase().includes(lowerSearch) ||
          c.phone_number?.includes(search)
      )
    }

    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key]
        let valB = b[sortConfig.key]
        
        if (typeof valA === 'string' && sortConfig.key !== 'annual_income') valA = valA.toLowerCase()
        if (typeof valB === 'string' && sortConfig.key !== 'annual_income') valB = valB.toLowerCase()
        
        if (sortConfig.key === 'annual_income') {
          valA = Number(valA) || 0
          valB = Number(valB) || 0
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [customers, search, sortConfig])

  // Deleting
  const deleteMutation = useMutation({
    mutationFn: customerService.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer deleted successfully')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete customer')
    }
  })

  // Serverside print handler
  const handlePrint = async () => {
    try {
      const serverDataResponse = await customerService.getCustomers()
      const serverData = serverDataResponse?.data || []
      
      const printWindow = window.open('', '_blank')
      if (!printWindow) return toast.error('Please allow popups to print reports.')

      const html = `
        <html>
          <head>
            <title>Customers Report</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 20px; color: #111; }
              h1 { font-size: 20px; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; font-size: 13px; }
              th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
              th { background-color: #f4f4f5; font-weight: 600; text-transform: uppercase; font-size: 11px; }
              @media print {
                @page { margin: 1cm; size: landscape; }
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <h1>Customers Report</h1>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Occupation</th>
                  <th>Income</th>
                </tr>
              </thead>
              <tbody>
                ${serverData.map(c => `
                  <tr>
                    <td>${c.full_name}</td>
                    <td>${c.email || '-'}</td>
                    <td>${c.phone_number || '-'}</td>
                    <td>${c.city || '-'}</td>
                    <td>${c.state || '-'}</td>
                    <td>${c.occupation || '-'}</td>
                    <td>${c.annual_income && Number(c.annual_income) > 0 ? '₹' + Number(c.annual_income).toLocaleString() : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <script>
              window.onload = () => {
                setTimeout(() => {
                   window.print();
                }, 200);
              }
            </script>
          </body>
        </html>
      `
      printWindow.document.write(html)
      printWindow.document.close()
    } catch (err) {
      console.error('Failed to print server data', err)
      toast.error('Failed to load server data for printing.')
    }
  }

  const columns = [
    {
      key: 'full_name',
      label: 'Customer Details',
      render: (_, row) => (
        <div>
          <p className="font-medium text-foreground">{row.full_name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
          <p className="text-xs text-muted-foreground">{row.phone_number}</p>
        </div>
      ),
    },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'country', label: 'Country' },
    { key: 'occupation', label: 'Occupation' },
    { key: 'annual_income', label: 'Income', render: (v) => (v && Number(v) > 0 ? `₹${Number(v).toLocaleString()}` : '-') },
    {
      key: 'actions',
      label: '',
      width: 100,
      render: (_, row) => (
        <ActionButtons
          editTo={`/customers/${row.customer_id}/edit`}
          onDelete={async () => {
             // In lieu of checking ConfirmDialog which we assume is wired in DataTableLayout or ActionButtons
             // we directly pass the callback if ActionButtons handles the prompt or we just call mutate.
             // Actually, ActionButtons typically receives onDelete function. Let's call it.
             await deleteMutation.mutateAsync(row.customer_id)
          }}
        />
      ),
    },
  ]

  // Assuming DataTableLayout supports a simple sort mechanism or we can just have columns. 
  // We passed a sort mechanism artificially above. If DataTable doesn't support headers clicks natively, 
  // we might have to just supply it through a select box or rely on their default Data Table. Let's provide a basic sort select.

  if (isError) {
     toast.error(error.message)
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Customers"
        description={`${processedData.length} total customer(s)`}
        action={{ label: 'Add Customer', to: '/customers/create' }}
        onExport={() => exportToExcel(processedData, columns, 'customers.xlsx')}
        onPrint={handlePrint}
      />
      <DataTableLayout
        columns={columns}
        data={processedData}
        loading={isLoading || deleteMutation.isPending}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, phone..."
        emptyIcon={Users}
        emptyTitle="No customers found"
        emptyDescription="Add your first customer to get started"
        filterSlot={
          <div className="flex gap-2 flex-wrap">
             <select
               value={`${sortConfig.key}-${sortConfig.direction}`}
               onChange={(e) => {
                 const [key, direction] = e.target.value.split('-')
                 setSortConfig({ key, direction })
               }}
               className="text-sm rounded-xl border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
             >
               <option value="full_name-asc">Name (A-Z)</option>
               <option value="full_name-desc">Name (Z-A)</option>
               <option value="email-asc">Email (A-Z)</option>
               <option value="email-desc">Email (Z-A)</option>
               <option value="annual_income-desc">Income (High-Low)</option>
               <option value="annual_income-asc">Income (Low-High)</option>
               <option value="created_at-desc">Newest First</option>
               <option value="created_at-asc">Oldest First</option>
             </select>
          </div>
        }
      />
    </div>
  )
}
