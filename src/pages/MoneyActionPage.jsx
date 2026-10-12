import { useEffect, useState } from 'react'
import { FiArrowDownLeft, FiArrowRight, FiArrowUpRight, FiCheck, FiCreditCard, FiRepeat } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import AuthenticatedLayout from '../components/AuthenticatedLayout.jsx'
import { accountService } from '../services/accountService.js'
import { transactionService } from '../services/transactionService.js'
import { formatCurrency, formatDateTime, formatTransactionType } from '../utils/formatters.js'
import { validateMoneyAmount, validateTransfer } from '../utils/validation.js'
import '../styles/transactions.css'

const ACTIONS = {
  deposit: {
    title: 'Deposit funds',
    description: 'Add funds to your account securely.',
    button: 'Deposit funds',
    icon: FiArrowDownLeft,
    submit: (amount) => transactionService.deposit(amount),
  },
  withdraw: {
    title: 'Withdraw funds',
    description: 'Withdraw funds from your account.',
    button: 'Withdraw funds',
    icon: FiArrowUpRight,
    submit: (amount) => transactionService.withdraw(amount),
  },
  transfer: {
    title: 'Transfer funds',
    description: 'Send funds to another MiniBank account.',
    button: 'Review and transfer',
    icon: FiRepeat,
    submit: (amount, recipientAccountNumber) => transactionService.transfer(recipientAccountNumber, amount),
  },
}

function TransactionResult({ result, action }) {
  if (!result) return null
  const entries = action === 'transfer'
    ? [['Money sent', result.debit], ['Money received', result.credit]].filter(([, entry]) => entry)
    : [[action === 'deposit' ? 'Deposit recorded' : 'Withdrawal recorded', result]]

  return (
    <section className="action-result" role="status" aria-live="polite">
      <div className="action-result-heading"><span className="result-check"><FiCheck aria-hidden="true" /></span><div><strong>{action === 'transfer' ? 'Transfer completed' : action === 'deposit' ? 'Deposit completed' : 'Withdrawal completed'}</strong><p>The banking API accepted the transaction.</p></div></div>
      {entries.length > 0 && <div className="action-result-list">{entries.map(([label, transaction]) => (
        <div className="action-result-row" key={label}><span>{label}</span><div><strong>{formatCurrency(transaction.amount)}</strong><small>{formatTransactionType(transaction.type)}{transaction.transactionId ? ` · #${transaction.transactionId}` : ''}</small>{transaction.balanceAfter !== undefined && <small>Balance after: {formatCurrency(transaction.balanceAfter)}</small>}{transaction.createdAt && <small>{formatDateTime(transaction.createdAt)}</small>}</div></div>
      ))}</div>}
      {entries.length === 0 && <p className="result-note">Transaction details were not included in the API response.</p>}
      <Link className="result-link" to="/dashboard">Return to account overview <FiArrowRight aria-hidden="true" /></Link>
    </section>
  )
}

export default function MoneyActionPage({ action }) {
  const config = ACTIONS[action]
  const ActionIcon = config.icon
  const [amount, setAmount] = useState('')
  const [recipientAccountNumber, setRecipientAccountNumber] = useState('')
  const [errors, setErrors] = useState({})
  const [requestError, setRequestError] = useState('')
  const [refreshError, setRefreshError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [accountLoading, setAccountLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    let cancelled = false
    accountService.getAccount()
      .then((response) => { if (!cancelled) setAccount(response) })
      .catch((error) => { if (!cancelled) setRefreshError(error.message || 'Current balance could not be loaded.') })
      .finally(() => { if (!cancelled) setAccountLoading(false) })
    return () => { cancelled = true }
  }, [])

  function updateAmount(value) {
    setAmount(value)
    setErrors((current) => ({ ...current, amount: undefined }))
    setRequestError('')
    setResult(null)
  }

  async function refreshAccount() {
    try {
      const refreshedAccount = await accountService.getAccount()
      setAccount(refreshedAccount)
      setRefreshError('')
    } catch (error) {
      setRefreshError(error.message || 'The account balance could not be refreshed.')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const values = action === 'transfer' ? { amount, recipientAccountNumber } : { amount }
    const nextErrors = action === 'transfer' ? validateTransfer(values) : validateMoneyAmount(amount)
    setErrors(nextErrors)
    setRequestError('')
    setResult(null)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      const response = await config.submit(Number(amount), recipientAccountNumber)
      setResult(response)
      setAmount('')
      setRecipientAccountNumber('')
      await refreshAccount()
    } catch (error) {
      setRequestError(error.message || 'The transaction could not be completed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthenticatedLayout account={account}>
      <section className="dashboard-heading">
        <div><span className="dashboard-eyebrow">ACCOUNT SERVICES</span><h1>{config.title}</h1><p>{config.description}</p></div>
      </section>

      {requestError && <div className="dashboard-error" role="alert">{requestError}</div>}
      {refreshError && <div className="action-info" role="status">{refreshError}</div>}
      <div className="action-page-grid">
        <section className="action-form-card">
          <div className="action-card-heading"><span className="action-main-icon"><ActionIcon aria-hidden="true" /></span><div><h2>{config.title}</h2><p>Enter the transaction details below.</p></div></div>
          <div className="action-current-balance"><span><FiCreditCard aria-hidden="true" /> Current balance</span><strong>{accountLoading ? 'Loading…' : account?.balance == null ? 'Unavailable' : formatCurrency(account.balance)}</strong></div>
          <form className="money-form" onSubmit={handleSubmit} noValidate>
            {action === 'transfer' && <label className="money-field" htmlFor="recipient-account">Recipient account number<input id="recipient-account" name="recipientAccountNumber" type="text" inputMode="numeric" autoComplete="off" maxLength={10} placeholder="10-digit account number" value={recipientAccountNumber} onChange={(event) => { setRecipientAccountNumber(event.target.value.replace(/\D/g, '').slice(0, 10)); setErrors((current) => ({ ...current, recipientAccountNumber: undefined })); setRequestError(''); setResult(null) }} aria-invalid={Boolean(errors.recipientAccountNumber)} aria-describedby={errors.recipientAccountNumber ? 'recipient-account-error' : undefined} />{errors.recipientAccountNumber && <span className="field-error" id="recipient-account-error">{errors.recipientAccountNumber}</span>}</label>}
            <label className="money-field" htmlFor="transaction-amount">Amount in Tanzanian shillings<span className="money-input-wrap"><span className="currency-prefix">TSh</span><input id="transaction-amount" name="amount" type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="0.00" value={amount} onChange={(event) => updateAmount(event.target.value)} aria-invalid={Boolean(errors.amount)} aria-describedby={errors.amount ? 'transaction-amount-error' : 'amount-hint'} /></span>{errors.amount && <span className="field-error" id="transaction-amount-error">{errors.amount}</span>}{!errors.amount && <span className="money-hint" id="amount-hint">Enter an amount greater than zero.</span>}</label>
            <button className="money-submit" type="submit" disabled={submitting}><ActionIcon aria-hidden="true" />{submitting ? 'Processing…' : config.button}</button>
          </form>
          <p className="money-security-note">Transactions are processed securely by the banking service.</p>
        </section>

        <aside className="action-help-card"><span className="help-icon"><FiCreditCard aria-hidden="true" /></span><h2>{action === 'transfer' ? 'Before you transfer' : action === 'deposit' ? 'About deposits' : 'About withdrawals'}</h2><p>{action === 'transfer' ? 'Check the recipient account number and amount before submitting. Transfers are recorded by the banking service.' : 'Your account balance and transaction history update after the banking service accepts the request.'}</p><div className="help-divider" /><div className="help-detail"><span>Minimum transaction</span><strong>TSh 0.01</strong></div>{action === 'transfer' && <div className="help-detail"><span>Recipient account</span><strong>10 digits</strong></div>}</aside>
      </div>
      <TransactionResult result={result} action={action} />
    </AuthenticatedLayout>
  )
}
