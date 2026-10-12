import { useCallback, useEffect, useState } from 'react'
import { FiCreditCard, FiRefreshCw, FiUser } from 'react-icons/fi'
import AuthenticatedLayout from '../components/AuthenticatedLayout.jsx'
import { accountService } from '../services/accountService.js'
import { formatCurrency } from '../utils/formatters.js'
import '../styles/profile.css'

export default function ProfilePage() {
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestKey, setRequestKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    accountService.getAccount()
      .then((response) => {
        if (cancelled) return
        setAccount(response)
        setError('')
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message || 'Account profile could not be loaded.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [requestKey])

  const refresh = useCallback(() => {
    setLoading(true)
    setError('')
    setAccount(null)
    setRequestKey((current) => current + 1)
  }, [])

  const holderName = account?.accountHolderName || 'N/A'
  const initial = holderName === 'N/A' ? 'A' : holderName.trim().charAt(0).toUpperCase()

  return (
    <AuthenticatedLayout account={account}>
      <section className="dashboard-heading">
        <div><span className="dashboard-eyebrow">ACCOUNT SETTINGS</span><h1>Profile and account</h1><p>View the account details provided by your banking service.</p></div>
        <button className="dashboard-refresh" type="button" onClick={refresh} disabled={loading}><FiRefreshCw aria-hidden="true" /> Refresh</button>
      </section>

      {error && <div className="dashboard-error" role="alert"><span>{error}</span><button type="button" onClick={refresh}>Try again</button></div>}

      <section className="profile-card" aria-label="Profile details">
        <div className="profile-card-header"><span className="profile-avatar">{loading ? '…' : initial}</span><div><span className="dashboard-eyebrow">ACCOUNT HOLDER</span><h2>{loading ? 'Loading…' : holderName}</h2><p>Personal account details</p></div></div>
        <div className="profile-details-grid">
          <article className="profile-detail"><span className="profile-detail-icon"><FiUser aria-hidden="true" /></span><div><span>Full name</span><strong>{loading ? 'Loading…' : holderName}</strong></div></article>
          <article className="profile-detail"><span className="profile-detail-icon"><FiCreditCard aria-hidden="true" /></span><div><span>Account number</span><strong>{loading ? 'Loading…' : account?.accountNumber || 'N/A'}</strong></div></article>
          <article className="profile-detail profile-balance"><span className="profile-detail-icon"><FiCreditCard aria-hidden="true" /></span><div><span>Current balance</span><strong>{loading ? 'Loading…' : account?.balance == null ? 'N/A' : formatCurrency(account.balance)}</strong></div></article>
        </div>
        <div className="profile-api-note"><strong>Profile data availability</strong><p>The documented account endpoint returns account holder name, account number, and balance. It does not return email or phone number, and the API documentation does not define a separate profile endpoint, so those details are not shown here.</p></div>
      </section>
    </AuthenticatedLayout>
  )
}
