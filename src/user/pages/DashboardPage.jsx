import { useCallback, useEffect, useState } from 'react'
import { FiArrowDownLeft, FiArrowUpRight, FiCreditCard, FiRefreshCw, FiRepeat, FiUser } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import AuthenticatedLayout from '../components/AuthenticatedLayout.jsx'
import { accountService } from '../services/accountService.js'
import { formatCurrency, formatDateTime, formatTransactionType, getTransactionDirection } from '../../utils/formatters.js'
import '../../user_styles/dashboard.css'

function RecentActivity({ transactions, loading, error }) {
  if (loading) {
    return <div className="activity-skeleton" role="status" aria-label="Loading recent activity"><span /><span /><span /></div>
  }

  if (error) {
    return <div className="dashboard-empty"><span className="empty-icon"><FiCreditCard aria-hidden="true" /></span><strong>Activity unavailable</strong><p>{error}</p></div>
  }

  if (!transactions.length) {
    return <div className="dashboard-empty"><span className="empty-icon"><FiCreditCard aria-hidden="true" /></span><strong>No transactions yet</strong><p>Your deposits, withdrawals, and transfers will appear here.</p></div>
  }

  return (
    <div className="activity-table-wrap">
      <table className="activity-table">
        <thead><tr><th scope="col">Transaction</th><th scope="col">Date</th><th scope="col">Balance after</th><th scope="col">Amount</th></tr></thead>
        <tbody>
          {transactions.map((transaction) => {
            const direction = getTransactionDirection(transaction.type)
            const Icon = direction === 'incoming' ? FiArrowDownLeft : FiArrowUpRight
            return (
              <tr key={transaction.id}>
                <td><div className="activity-type"><span className={`activity-icon ${direction}`}><Icon aria-hidden="true" /></span><span><strong>{formatTransactionType(transaction.type)}</strong><small>Transaction {transaction.id}</small></span></div></td>
                <td>{formatDateTime(transaction.createdAt)}</td>
                <td>{formatCurrency(transaction.balanceAfter)}</td>
                <td className={direction === 'incoming' ? 'amount-incoming' : 'amount-outgoing'}>{direction === 'incoming' ? '+' : '−'}{formatCurrency(transaction.amount)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function DashboardPage() {
  const [account, setAccount] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activityError, setActivityError] = useState('')
  const [requestKey, setRequestKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([accountService.getAccount(), accountService.getRecentTransactions()])
      .then(([accountResult, transactionResult]) => {
        if (cancelled) return
        const accountError = accountResult.status === 'rejected' ? accountResult.reason : null
        const transactionError = transactionResult.status === 'rejected' ? transactionResult.reason : null
        setAccount(accountError ? null : accountResult.value)
        setTransactions(transactionError || !Array.isArray(transactionResult.value?.content) ? [] : transactionResult.value.content)
        setActivityError(transactionError?.message || '')
        setError(accountError?.message || transactionError?.message || '')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [requestKey])

  const retry = useCallback(() => {
    setLoading(true)
    setError('')
    setActivityError('')
    setAccount(null)
    setTransactions([])
    setRequestKey((key) => key + 1)
  }, [])

  const accountNumber = account?.accountNumber || 'N/A'
  const holderName = account?.accountHolderName || 'N/A'

  return (
    <AuthenticatedLayout account={account}>
      <section className="dashboard-heading">
        <div><span className="dashboard-eyebrow">YOUR FINANCES</span><h1>Account overview</h1><p>Review your account balance and recent activity.</p></div>
        <button className="dashboard-refresh" type="button" onClick={retry} disabled={loading}><FiRefreshCw aria-hidden="true" /> Refresh</button>
      </section>

      {error && <div className="dashboard-error" role="alert"><span>{error}</span><button type="button" onClick={retry}>Try again</button></div>}

      <section className="dashboard-summary" aria-label="Account summary">
        <article className="balance-card">
          <div className="balance-card-top"><span>CURRENT BALANCE</span><span className="balance-card-icon"><FiCreditCard aria-hidden="true" /></span></div>
          {loading ? <div className="balance-skeleton" aria-label="Loading account balance" /> : <strong className="balance-amount">{account?.balance === undefined || account?.balance === null ? 'N/A' : formatCurrency(account.balance)}</strong>}
          <div className="balance-card-footer"><span>Account number</span><strong>{loading ? 'Loading…' : accountNumber}</strong></div>
          <div className="balance-decoration" aria-hidden="true" />
        </article>

        <article className="account-detail-card">
          <div className="account-detail-heading"><span className="detail-icon"><FiUser aria-hidden="true" /></span><div><span>ACCOUNT HOLDER</span><strong>{loading ? 'Loading…' : holderName}</strong></div></div>
          <div className="detail-divider" />
          <div className="account-detail-heading"><span className="detail-icon card-detail-icon"><FiCreditCard aria-hidden="true" /></span><div><span>ACCOUNT NUMBER</span><strong className="detail-account-number">{loading ? 'Loading…' : accountNumber}</strong></div></div>
        </article>
      </section>

      <nav className="quick-actions" aria-label="Quick account actions">
        <Link to="/deposit"><span className="quick-action-icon deposit-action"><FiArrowDownLeft aria-hidden="true" /></span><span><strong>Deposit</strong><small>Add funds</small></span></Link>
        <Link to="/withdraw"><span className="quick-action-icon withdraw-action"><FiArrowUpRight aria-hidden="true" /></span><span><strong>Withdraw</strong><small>Access funds</small></span></Link>
        <Link to="/transfer"><span className="quick-action-icon transfer-action"><FiRepeat aria-hidden="true" /></span><span><strong>Transfer</strong><small>Send funds</small></span></Link>
      </nav>

      <section className="activity-panel" aria-labelledby="activity-title">
        <div className="activity-heading"><div><span className="dashboard-eyebrow">ACCOUNT ACTIVITY</span><h2 id="activity-title">Recent transactions</h2></div><span className="activity-count">{loading ? '—' : activityError ? 'Unavailable' : `${transactions.length} recent`}</span></div>
        <RecentActivity transactions={transactions} loading={loading} error={activityError} />
      </section>
    </AuthenticatedLayout>
  )
}
