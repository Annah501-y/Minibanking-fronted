const CURRENCY_CODE = import.meta.env.VITE_CURRENCY_CODE || 'TZS'
const CURRENCY_LOCALE = CURRENCY_CODE === 'TZS' ? 'en-TZ' : undefined

export function formatCurrency(value) {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: CURRENCY_CODE,
  }).format(Number(value) || 0)
}

export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatTransactionType(type) {
  const labels = {
    DEPOSIT: 'Deposit',
    WITHDRAWAL: 'Withdrawal',
    TRANSFER_IN: 'Transfer received',
    TRANSFER_OUT: 'Transfer sent',
  }
  return labels[type] || String(type || 'Transaction').replaceAll('_', ' ').toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function getTransactionDirection(type) {
  return type === 'WITHDRAWAL' || type === 'TRANSFER_OUT' ? 'outgoing' : 'incoming'
}
