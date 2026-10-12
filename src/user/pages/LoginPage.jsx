import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import { useAuth } from '../../context/useAuth.js'
import { validateLogin } from '../../utils/validation.js'

export default function LoginPage() {
  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [values, setValues] = useState({ email: location.state?.email || '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const registration = location.state?.registrationSuccess
  const autoLoginError = location.state?.autoLoginError

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setFormError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateLogin(values)
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length) return

    setLoading(true)
    try {
      const session = await login(values.email, values.password)
      navigate(session.role === 'USER' ? '/dashboard' : '/admin', { replace: true })
    } catch (error) {
      setFormError(error.message || 'Sign in failed. Check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      heading="Welcome back"
      description="Sign in to access your account."
      footer={<>New to MiniBank? <Link to="/register">Create an account</Link></>}
    >
      {registration && <div className="auth-notice" role="status">Account created for {registration.fullName || registration.email}. You can now sign in{registration.accountNumber ? ` with account ${registration.accountNumber}` : ''}.</div>}
      {autoLoginError && <div className="auth-error" role="alert">Your account was created, but automatic sign-in failed: {autoLoginError} Please sign in below.</div>}
      {formError && <div className="auth-error" role="alert">{formError}</div>}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="auth-field" htmlFor="login-email">Email address
          <input id="login-email" name="email" type="email" autoComplete="username" value={values.email} onChange={(event) => updateField('email', event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'login-email-error' : undefined} />
          {errors.email && <span className="field-error" id="login-email-error">{errors.email}</span>}
        </label>
        <label className="auth-field" htmlFor="login-password">Password
          <span className="password-control"><input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={values.password} onChange={(event) => updateField('password', event.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'login-password-error' : undefined} /><button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}</button></span>
          {errors.password && <span className="field-error" id="login-password-error">{errors.password}</span>}
        </label>
        <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </AuthLayout>
  )
}
