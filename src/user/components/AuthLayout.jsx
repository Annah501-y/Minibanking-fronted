import { Link } from 'react-router-dom'
import '../../user_styles/auth.css'

export default function AuthLayout({ children, heading, description, footer }) {
  return (
    <main className="auth-page">
      <section className="auth-brand-panel" aria-label="Mini Banking System">
        <Link className="auth-brand" to="/login"><span className="auth-brand-symbol">M</span><span>MiniBank</span></Link>
        <div className="auth-brand-copy">
          <span className="auth-kicker">MINI BANKING SYSTEM</span>
          <h1>Banking made<br />clear and simple.</h1>
        </div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-form-heading"><span className="auth-mobile-brand">MiniBank</span><span className="auth-kicker">YOUR ACCOUNT</span><h2>{heading}</h2><p>{description}</p></div>
          {children}
          {footer && <div className="auth-footer">{footer}</div>}
        </div>
      </section>
    </main>
  )
}
