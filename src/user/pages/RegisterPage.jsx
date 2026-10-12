import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import { useAuth } from '../../context/useAuth.js'
import { validateRegistration } from '../../utils/validation.js'

const INITIAL_VALUES = { fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' }

export default function RegisterPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setFormError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateRegistration(values)
    setErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length) return

    setLoading(true)
    let registrationResponse
    try {
      registrationResponse = await register(values)
    } catch (error) {
      setFormError(error.message || 'Registration failed. Review your details and try again.')
      setLoading(false)
      return
    }

    try {
      const session = await login(values.email, values.password)
      navigate(session.role === 'USER' ? '/dashboard' : '/admin', { replace: true })
    } catch (error) {
      navigate('/login', {
        replace: true,
        state: {
          registrationSuccess: registrationResponse,
          email: values.email,
          autoLoginError: error.message || 'Sign in automatically failed. Please sign in to continue.',
        },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      heading="Create your account"
      description="Create a customer account and get your bank account automatically."
      footer={<>Already registered? <Link to="/login">Sign in</Link></>}
    >
      {formError && <div className="auth-error" role="alert">{formError}</div>}
      <div className="auth-notice" role="note">.</div>
      <form className="auth-form register-form" onSubmit={handleSubmit} noValidate>
        <label className="auth-field" htmlFor="register-name">Full name
          <input id="register-name" name="fullName" type="text" autoComplete="name" maxLength={150} value={values.fullName} onChange={(event) => updateField('fullName', event.target.value)} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'register-name-error' : undefined} />
          {errors.fullName && <span className="field-error" id="register-name-error">{errors.fullName}</span>}
        </label>
        <label className="auth-field" htmlFor="register-email">Email address
          <input id="register-email" name="email" type="email" autoComplete="email" maxLength={255} value={values.email} onChange={(event) => updateField('email', event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'register-email-error' : undefined} />
          {errors.email && <span className="field-error" id="register-email-error">{errors.email}</span>}
        </label>
        <label className="auth-field" htmlFor="register-phone">Phone number <span className="field-hint">Include country code</span>
          <input id="register-phone" name="phoneNumber" type="tel" autoComplete="tel" inputMode="tel" placeholder="+14155552671" value={values.phoneNumber} onChange={(event) => updateField('phoneNumber', event.target.value)} aria-invalid={Boolean(errors.phoneNumber)} aria-describedby={errors.phoneNumber ? 'register-phone-error' : undefined} />
          {errors.phoneNumber && <span className="field-error" id="register-phone-error">{errors.phoneNumber}</span>}
        </label>
        <label className="auth-field" htmlFor="register-password">Password <span className="field-hint">8 to 72 characters</span>
          <span className="password-control"><input id="register-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={72} value={values.password} onChange={(event) => updateField('password', event.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'register-password-error' : undefined} /><button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}</button></span>
          {errors.password && <span className="field-error" id="register-password-error">{errors.password}</span>}
        </label>
        <label className="auth-field" htmlFor="register-confirm-password">Confirm password
          <span className="password-control">
            <input id="register-confirm-password" name="confirmPassword" 
            type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password"
             value={values.confirmPassword} onChange={(event) =>
               updateField('confirmPassword', event.target.value)} 
               aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 
                'register-confirm-error' : undefined} />
                <button className="password-toggle" type="button" onClick={(

          ) => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? 
          'Hide confirmation password' : 'Show confirmation password'}>{showConfirmPassword ?
           <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}</button></span>
          {errors.confirmPassword && <span className="field-error"
           id="register-confirm-error">{errors.confirmPassword}</span>}
        </label>
        <button className="auth-submit"
         type="submit" disabled={loading}>{loading ? 
         'Creating account…' : 'Create account'}
         </button>
      </form>
    </AuthLayout>
  )
}
