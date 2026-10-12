import { FiShield } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import '../styles/auth.css'

export default function AuthLayout({ children, heading, description, footer }) {
  return (
    <main className="auth-page">
      <section className="auth-brand-panel" aria-label="Mini Banking System">
        <Link className="auth-brand" to="/login"><span className="auth-brand-symbol">M</span><span>MiniBank</span></Link>
        <div className="auth-brand-copy">
          <span className="auth-kicker">MINI BANKING SYSTEM</span>
          <h1>Banking made<br />clear and simple.</h1>
          <p>Secure access to your account, wherever you are.</p>
        </div>
        <div className="auth-security"><FiShield aria-hidden="true" /><span>Protected by secure authentication</span></div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-heading"><span className="auth-mobile-brand">MiniBank</span><span className="auth-kicker">YOUR ACCOUNT</span><h2>{heading}</h2><p>{description}</p></div>
          {children}
          {footer && <div className="auth-footer">{footer}</div>}
          <p className="auth-legal">By continuing, you agree to use this service responsibly.</p>
        </div>
      </section>
    </main>
  )
}
