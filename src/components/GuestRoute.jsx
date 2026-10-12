import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import AuthStatus from '../user/components/AuthStatus.jsx'

export default function GuestRoute() {
  const { isAuthenticated, isRoleChecking, role, roleError, retryRoleCheck, logout } = useAuth()
  if (isAuthenticated && isRoleChecking) return <AuthStatus title="Verifying account" loading />
  if (isAuthenticated && roleError) return <AuthStatus title="Unable to verify account" message={roleError} onRetry={retryRoleCheck} onSignOut={logout} />
  if (isAuthenticated) return <Navigate to={role === 'USER' ? '/dashboard' : '/admin'} replace />
  return <Outlet />
}
