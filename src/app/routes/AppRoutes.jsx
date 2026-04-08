import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import ProtectedRoute from './ProtectedRoute'
import LoginPage from '@/features/auth/LoginPage'
import { CardSkeleton } from '@/components/shared/SkeletonLoaders'

// Lazy-loaded pages
const Dashboard = lazy(() => import('@/features/dashboard/DashboardPage'))
const CustomersList = lazy(() => import('@/features/customers/CustomersPage'))
const CustomerCreate = lazy(() => import('@/features/customers/CustomerCreatePage'))
const CustomerEdit = lazy(() => import('@/features/customers/CustomerEditPage'))
const CustomerView = lazy(() => import('@/features/customers/CustomerViewPage'))
const LoansList = lazy(() => import('@/features/loans/LoansPage'))
const LoanCreate = lazy(() => import('@/features/loans/LoanCreatePage'))
const LoanEdit = lazy(() => import('@/features/loans/LoanEditPage'))
const LoanView = lazy(() => import('@/features/loans/LoanViewPage'))
const SavingsList = lazy(() => import('@/features/savings/SavingsPage'))
const SavingsCreate = lazy(() => import('@/features/savings/SavingsCreatePage'))
const GroupsList = lazy(() => import('@/features/groups/GroupsPage'))
const GroupCreate = lazy(() => import('@/features/groups/GroupCreatePage'))
const GroupEdit = lazy(() => import('@/features/groups/GroupEditPage'))
const TransactionsList = lazy(() => import('@/features/transactions/TransactionsPage'))
const ApiDocs = lazy(() => import('@/features/docs/ApiDocsPage'))

function PageLoader() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded-xl w-48 animate-pulse" />
      <CardSkeleton count={4} />
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route
          path="/"
          element={
            <Suspense fallback={<PageLoader />}>
              <Dashboard />
            </Suspense>
          }
        />
        
        {/* Customers */}
        <Route
          path="/customers"
          element={<Suspense fallback={<PageLoader />}><CustomersList /></Suspense>}
        />
        <Route
          path="/customers/create"
          element={<Suspense fallback={<PageLoader />}><CustomerCreate /></Suspense>}
        />
        <Route
          path="/customers/:id/edit"
          element={<Suspense fallback={<PageLoader />}><CustomerEdit /></Suspense>}
        />
        <Route
          path="/customers/:id"
          element={<Suspense fallback={<PageLoader />}><CustomerView /></Suspense>}
        />

        {/* Loans */}
        <Route
          path="/loans"
          element={<Suspense fallback={<PageLoader />}><LoansList /></Suspense>}
        />
        <Route
          path="/loans/create"
          element={<Suspense fallback={<PageLoader />}><LoanCreate /></Suspense>}
        />
        <Route
          path="/loans/:id/edit"
          element={<Suspense fallback={<PageLoader />}><LoanEdit /></Suspense>}
        />
        <Route
          path="/loans/:id"
          element={<Suspense fallback={<PageLoader />}><LoanView /></Suspense>}
        />

        {/* Savings */}
        <Route
          path="/savings"
          element={<Suspense fallback={<PageLoader />}><SavingsList /></Suspense>}
        />
        <Route
          path="/savings/create"
          element={<Suspense fallback={<PageLoader />}><SavingsCreate /></Suspense>}
        />

        {/* Groups */}
        <Route
          path="/groups"
          element={<Suspense fallback={<PageLoader />}><GroupsList /></Suspense>}
        />
        <Route
          path="/groups/create"
          element={<Suspense fallback={<PageLoader />}><GroupCreate /></Suspense>}
        />
        <Route
          path="/groups/:id/edit"
          element={<Suspense fallback={<PageLoader />}><GroupEdit /></Suspense>}
        />

        {/* Transactions */}
        <Route
          path="/transactions"
          element={<Suspense fallback={<PageLoader />}><TransactionsList /></Suspense>}
        />

        </Route>
      </Route>

      {/* Developer Docs (Unprotected) */}
      <Route
        path="/api-docs"
        element={<Suspense fallback={<PageLoader />}><ApiDocs /></Suspense>}
      />
    </Routes>
  )
}
