import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContextInstance.js'
import { ApiError } from '../services/apiClient.js'
import { authService } from '../services/authService.js'

const TOKEN_STORAGE_KEY = 'minibanking.accessToken'
const LEGACY_TOKEN_STORAGE_KEY = 'minibanking.admin.accessToken'
const ALLOWED_ROLES = new Set(['USER', 'ADMIN', 'SUPER_ADMIN'])

function readStoredToken() {
  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY) || window.localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY)
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
    window.localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY)
  }
  return token
}

function normalizeRole(response) {
  const role = String(response?.role || '').replace(/^ROLE_/i, '').toUpperCase()
  if (!ALLOWED_ROLES.has(role)) {
    throw new ApiError('The account role response was missing or unsupported. Contact your administrator.')
  }
  return role
}

function readInitialSession() {
  const accessToken = readStoredToken()
  return { accessToken, role: null, checkingRole: Boolean(accessToken), roleError: '' }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readInitialSession)

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    window.localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY)
    setSession({ accessToken: null, role: null, checkingRole: false, roleError: '' })
  }, [])

  useEffect(() => {
    window.addEventListener('auth:unauthorized', logout)
    return () => window.removeEventListener('auth:unauthorized', logout)
  }, [logout])

  useEffect(() => {
    if (!session.accessToken || !session.checkingRole) return undefined

    let cancelled = false
    authService.getCurrentRole()
      .then((response) => {
        const role = normalizeRole(response)
        if (!cancelled) setSession((current) => current.accessToken === session.accessToken
          ? { ...current, role, checkingRole: false, roleError: '' }
          : current)
      })
      .catch((error) => {
        if (!cancelled) setSession((current) => current.accessToken === session.accessToken
          ? { ...current, role: null, checkingRole: false, roleError: error.message || 'Unable to verify your account role.' }
          : current)
      })

    return () => { cancelled = true }
  }, [session.accessToken, session.checkingRole])

  const login = useCallback(async (email, password) => {
    const response = await authService.login({ email: email.trim(), password })
    if (!response?.accessToken) {
      throw new ApiError('The login response did not include an access token.')
    }

    window.localStorage.setItem(TOKEN_STORAGE_KEY, response.accessToken)
    try {
      const role = normalizeRole(await authService.getCurrentRole())
      setSession({ accessToken: response.accessToken, role, checkingRole: false, roleError: '' })
      return { ...response, role }
    } catch (error) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY)
      window.localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY)
      setSession({ accessToken: null, role: null, checkingRole: false, roleError: '' })
      throw error
    }
  }, [])

  const retryRoleCheck = useCallback(() => {
    if (session.accessToken) {
      setSession((current) => ({ ...current, checkingRole: true, roleError: '' }))
    }
  }, [session.accessToken])

  const register = useCallback((registration) => authService.register({
    fullName: registration.fullName.trim(),
    email: registration.email.trim(),
    phoneNumber: registration.phoneNumber.trim(),
    password: registration.password,
  }), [])

  const value = useMemo(() => ({
    accessToken: session.accessToken,
    role: session.role,
    isAdmin: session.role === 'ADMIN' || session.role === 'SUPER_ADMIN',
    isSuperAdmin: session.role === 'SUPER_ADMIN',
    isRoleChecking: session.checkingRole,
    roleError: session.roleError,
    isAuthenticated: Boolean(session.accessToken),
    login,
    logout,
    register,
    retryRoleCheck,
  }), [session, login, logout, register, retryRoleCheck])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
