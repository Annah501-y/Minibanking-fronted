const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const E164_PHONE_PATTERN = /^\+[1-9]\d{7,14}$/

/** Validate fields against the lengths and phone format in the OpenAPI schema. */
export function validateRegistration(values) {
  const errors = {}
  const fullName = values.fullName.trim()
  const email = values.email.trim()
  const phoneNumber = values.phoneNumber.trim()

  if (!fullName) errors.fullName = 'Enter your full name.'
  else if (fullName.length > 150) errors.fullName = 'Full name must be 150 characters or fewer.'

  if (!email) errors.email = 'Enter your email address.'
  else if (email.length > 255 || !EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.'

  if (!phoneNumber) errors.phoneNumber = 'Enter your phone number with country code.'
  else if (!E164_PHONE_PATTERN.test(phoneNumber)) errors.phoneNumber = 'Use international format, for example +14155552671.'

  if (!values.password) errors.password = 'Create a password.'
  else if (values.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  else if (values.password.length > 72) errors.password = 'Password must be 72 characters or fewer.'

  if (!values.confirmPassword) errors.confirmPassword = 'Confirm your password.'
  else if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match.'

  return errors
}

export function validateLogin(values) {
  const errors = {}
  const email = values.email.trim()
  if (!email) errors.email = 'Enter your email address.'
  else if (email.length > 255 || !EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address.'
  if (!values.password) errors.password = 'Enter your password.'
  else if (values.password.length > 72) errors.password = 'Password must be 72 characters or fewer.'
  return errors
}

export function validateMoneyAmount(amount) {
  const errors = {}
  const value = Number(amount)
  if (!String(amount).trim()) errors.amount = 'Enter an amount.'
  else if (!Number.isFinite(value) || value < 0.01) errors.amount = 'Enter an amount greater than or equal to 0.01.'
  return errors
}

export function validateTransfer(values) {
  const errors = validateMoneyAmount(values.amount)
  const recipientAccountNumber = values.recipientAccountNumber.trim()
  if (!recipientAccountNumber) errors.recipientAccountNumber = 'Enter the recipient account number.'
  else if (!/^\d{10}$/.test(recipientAccountNumber)) errors.recipientAccountNumber = 'Account number must contain exactly 10 digits.'
  return errors
}
