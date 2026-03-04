import { createBrowserRouter } from 'react-router-dom'
import AuthLayout from '@/components/layout/AuthLayout'
import AppLayout from '@/components/layout/AppLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { RouteErrorBoundary } from '@/components/shared/ErrorBoundary'
import SignupPage from '@/pages/auth/SignupPage'
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import ProfilePage from '@/pages/profile/ProfilePage'
import SettingsPage from '@/pages/settings/SettingsPage'
import NotesPage from '@/pages/notes/NotesPage'
import GroceriesPage from '@/pages/groceries/GroceriesPage'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <SignupPage /> },
      { path: 'login', element: <LoginPage /> },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'notes', element: <NotesPage />, errorElement: <RouteErrorBoundary /> },
      { path: 'groceries', element: <GroceriesPage />, errorElement: <RouteErrorBoundary /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
