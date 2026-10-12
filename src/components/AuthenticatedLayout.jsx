import { useState } from 'react'
import { FiArrowDownLeft, FiArrowUpRight, FiClock, FiGrid, FiLogOut, FiMenu, FiRepeat, FiShield, FiUser, FiX } from 'react-icons/fi'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

export default function AuthenticatedLayout({ account, children }) {
  const { isAdmin, logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const holderName = account?.accountHolderName || 'My account'
  const initial = holderName.trim().charAt(0).toUpperCase() || 'M'
  const pageTitle = {
    '/dashboard': 'Overview',
    '/transactions': 'Transactions',
    '/profile': 'Profile',
    '/deposit': 'Deposit',
    '/withdraw': 'Withdraw',
    '/transfer': 'Transfer',
    '/admin': 'Administration',
  }[location.pathname] || 'Overview'

  return (
    <div className="bank-shell">
      <aside className={`bank-sidebar${menuOpen ? ' is-open' : ''}`}>
        <div className="bank-brand-row">
          <Link className="bank-brand" to="/dashboard" onClick={() => setMenuOpen(false)}><span className="bank-brand-mark">M</span><span>MiniBank<small>PERSONAL BANKING</small></span></Link>
          <button className="sidebar-close" type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><FiX /></button>
        </div>
        <span className="bank-nav-heading">BANKING</span>
        <nav className="bank-nav" aria-label="Main navigation">
          <NavLink end to="/dashboard" className={({ isActive }) => `bank-nav-item${isActive ? ' is-active' : ''}`} onClick={() => setMenuOpen(false)}><FiGrid aria-hidden="true" /><span>Overview</span></NavLink>
          <NavLink to="/transactions" className={({ isActive }) => `bank-nav-item${isActive ? ' is-active' : ''}`} onClick={() => setMenuOpen(false)}><FiClock aria-hidden="true" /><span>Transactions</span></NavLink>
          <NavLink to="/profile" className={({ isActive }) => `bank-nav-item${isActive ? ' is-active' : ''}`} onClick={() => setMenuOpen(false)}><FiUser aria-hidden="true" /><span>Profile</span></NavLink>
          <NavLink to="/deposit" className={({ isActive }) => `bank-nav-item${isActive ? ' is-active' : ''}`} onClick={() => setMenuOpen(false)}><FiArrowDownLeft aria-hidden="true" /><span>Deposit</span></NavLink>
          <NavLink to="/withdraw" className={({ isActive }) => `bank-nav-item${isActive ? ' is-active' : ''}`} onClick={() => setMenuOpen(false)}><FiArrowUpRight aria-hidden="true" /><span>Withdraw</span></NavLink>
          <NavLink to="/transfer" className={({ isActive }) => `bank-nav-item${isActive ? ' is-active' : ''}`} onClick={() => setMenuOpen(false)}><FiRepeat aria-hidden="true" /><span>Transfer</span></NavLink>
          {isAdmin && <>
            <span className="bank-nav-heading bank-admin-heading">ADMINISTRATION</span>
            <NavLink to="/admin" className={({ isActive }) => `bank-nav-item${isActive ? ' is-active' : ''}`} onClick={() => setMenuOpen(false)}><FiShield aria-hidden="true" /><span>Admin console</span></NavLink>
          </>}
        </nav>
        <div className="bank-sidebar-footer">
          <div className="bank-secure-note"><span className="bank-secure-dot" /><span>Secure connection</span></div>
          <button className="bank-signout" type="button" onClick={logout}><FiLogOut aria-hidden="true" /><span>Sign out</span></button>
        </div>
      </aside>
      {menuOpen && <button className="bank-backdrop" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

      <div className="bank-main">
        <header className="bank-topbar">
          <button className="bank-menu-toggle" type="button" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><FiMenu /></button>
          <div className="bank-topbar-title">Personal banking <span>/</span> <strong>{pageTitle}</strong></div>
          <div className="bank-user-chip"><span className="bank-user-avatar">{initial}</span><span className="bank-user-name">{holderName}</span></div>
        </header>
        <main className="bank-content">{children}</main>
      </div>
    </div>
  )
}
