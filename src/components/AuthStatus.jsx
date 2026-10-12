export default function AuthStatus({ title, message, loading = false, onRetry, onSignOut }) {
  return (
    <main className="login-shell">
      <section className="login-card" aria-live="polite">
        <div className="brand-mark">M</div>
        <p className="eyebrow">MINI BANKING SYSTEM</p>
        <h1>{title}</h1>
        <p className="muted">{message}</p>
        {loading && <div className="loading-bar" role="status">Checking your account role…</div>}
        {onRetry && <button className="button button-primary button-wide" type="button" onClick={onRetry}>Retry verification</button>}
        {onSignOut && <button className="auth-submit" type="button" onClick={onSignOut}>Sign out</button>}
      </section>
    </main>
  )
}
