import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import AuthStatus from '../user/components/AuthStatus.jsx'

export default function ProtectedRoute({ requiredRole }) {
  const { isAuthenticated, isRoleChecking, role, roleError, retryRoleCheck, logout } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  if (isRoleChecking) return <AuthStatus title="Verifying account" loading />
  if (roleError) return <AuthStatus title="Unable to verify account" message={roleError} onRetry={retryRoleCheck} onSignOut={logout} />
  const hasRequiredRole = requiredRole === 'ADMIN'
    ? role === 'ADMIN' || role === 'SUPER_ADMIN'
    : !requiredRole || role === requiredRole
  if (!hasRequiredRole) {
    return <Navigate to={role === 'USER' ? '/dashboard' : '/admin'} replace />
  }
  return <Outlet />
}
