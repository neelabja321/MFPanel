import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import ProtectedRoute from './ProtectedRoute'
import { PermissionRoute, HomeRoute, AccessDeniedPage } from './PermissionRoute'
import LoginPage from '@/features/auth/LoginPage'
import { CardSkeleton } from '@/components/shared/SkeletonLoaders'
import { MODULES, PERMISSIONS } from '@/lib/accessControl'

const Dashboard = lazy(() => import('@/features/dashboard/DashboardPage'))
const CustomersList = lazy(() => import('@/pages/Customer/List'))
const CustomerCreate = lazy(() => import('@/pages/Customer/Create'))
const CustomerEdit = lazy(() => import('@/pages/Customer/Edit'))
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
const UsersList = lazy(() => import('@/features/users/UsersPage'))
const UserCreate = lazy(() => import('@/features/users/UserCreatePage'))
const UserEdit = lazy(() => import('@/features/users/UserEditPage'))
const RolesList = lazy(() => import('@/pages/Role/List'))
const RoleCreate = lazy(() => import('@/pages/Role/Create'))
const RoleEdit = lazy(() => import('@/pages/Role/Edit'))
const RoleView = lazy(() => import('@/pages/Role/View'))
const RoleAccessMatrix = lazy(() => import('@/pages/Role/AccessMatrix'))
const ApiDocs = lazy(() => import('@/features/docs/ApiDocsPage'))

function PageLoader() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded-xl w-48 animate-pulse" />
      <CardSkeleton count={4} />
    </div>
  )
}

function page(Component, module, permission = PERMISSIONS.LIST) {
  return (
    <PermissionRoute module={module} permission={permission}>
      <Suspense fallback={<PageLoader />}><Component /></Suspense>
    </PermissionRoute>
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
            element={(
              <HomeRoute>
                <Suspense fallback={<PageLoader />}><Dashboard /></Suspense>
              </HomeRoute>
            )}
          />
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          <Route path="/customers" element={page(CustomersList, MODULES.CUSTOMER)} />
          <Route path="/customers/create" element={page(CustomerCreate, MODULES.CUSTOMER, PERMISSIONS.CREATE)} />
          <Route path="/customers/:id/edit" element={page(CustomerEdit, MODULES.CUSTOMER, PERMISSIONS.EDIT)} />
          <Route path="/customers/:id" element={page(CustomerView, MODULES.CUSTOMER)} />

          <Route path="/loans" element={page(LoansList, MODULES.LOAN)} />
          <Route path="/loans/create" element={page(LoanCreate, MODULES.LOAN, PERMISSIONS.CREATE)} />
          <Route path="/loans/:id/edit" element={page(LoanEdit, MODULES.LOAN, PERMISSIONS.EDIT)} />
          <Route path="/loans/:id" element={page(LoanView, MODULES.LOAN)} />

          <Route path="/savings" element={page(SavingsList, MODULES.DEPOSIT)} />
          <Route path="/savings/create" element={page(SavingsCreate, MODULES.DEPOSIT, PERMISSIONS.CREATE)} />

          <Route path="/groups" element={page(GroupsList, MODULES.GROUP)} />
          <Route path="/groups/create" element={page(GroupCreate, MODULES.GROUP, PERMISSIONS.CREATE)} />
          <Route path="/groups/:id/edit" element={page(GroupEdit, MODULES.GROUP, PERMISSIONS.EDIT)} />

          <Route path="/transactions" element={page(TransactionsList, [MODULES.DEPOSIT, MODULES.LOAN])} />

          <Route path="/users" element={page(UsersList, MODULES.ADMINISTRATOR)} />
          <Route path="/users/create" element={page(UserCreate, MODULES.ADMINISTRATOR, PERMISSIONS.CREATE)} />
          <Route path="/users/:id/edit" element={page(UserEdit, MODULES.ADMINISTRATOR, PERMISSIONS.EDIT)} />

          <Route path="/roles" element={page(RolesList, MODULES.ADMINISTRATOR)} />
          <Route path="/roles/create" element={page(RoleCreate, MODULES.ADMINISTRATOR, PERMISSIONS.CREATE)} />
          <Route path="/roles/:id/edit" element={page(RoleEdit, MODULES.ADMINISTRATOR, PERMISSIONS.EDIT)} />
          <Route path="/roles/:id/access" element={page(RoleAccessMatrix, MODULES.ADMINISTRATOR, PERMISSIONS.EDIT)} />
          <Route path="/roles/:id" element={page(RoleView, MODULES.ADMINISTRATOR)} />
        </Route>
      </Route>

      <Route
        path="/api-docs"
        element={<Suspense fallback={<PageLoader />}><ApiDocs /></Suspense>}
      />
    </Routes>
  )
}
