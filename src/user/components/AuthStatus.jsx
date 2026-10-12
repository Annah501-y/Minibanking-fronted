import '../../user_styles/auth.css'

export default function AuthStatus({ title, message, loading = false, onRetry, onSignOut }) {
  return (
    <main className="auth-status-page">
      <section className="auth-status-card" aria-live="polite">
        <div className="auth-status-mark">M</div>
        <p className="auth-status-eyebrow">MINI BANKING SYSTEM</p>
        <h1>{title}</h1>
        {message && <p className="auth-status-message">{message}</p>}
        {loading && <div className="auth-status-loading" role="status">Checking account role…</div>}
        {onRetry && <button className="auth-submit auth-status-button" type="button" onClick={onRetry}>Retry verification</button>}
        {onSignOut && <button className="auth-submit" type="button" onClick={onSignOut}>Sign out</button>}
      </section>
    </main>
  )
}
