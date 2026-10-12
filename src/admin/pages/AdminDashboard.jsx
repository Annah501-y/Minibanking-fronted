import { useEffect, useMemo, useState } from 'react'
import { FiArrowUpRight, FiChevronRight, FiCreditCard, FiGrid, FiLogOut, FiMenu, FiSearch, FiUserPlus, FiUsers } from 'react-icons/fi'
import { useAuth } from '../../context/useAuth.js'
import { AdminApiError, api } from '../services/adminApi.js'
import { formatCurrency } from '../../utils/formatters.js'
import { validateRegistration } from '../../utils/validation.js'
import '../../admin_styles/admin.css'

const PAGE_SIZE = 10
const EMPTY_ROWS = []
const icons = {
  grid: FiGrid,
  people: FiUsers,
  wallet: FiCreditCard,
  search: FiSearch,
  arrow: FiArrowUpRight,
  chevron: FiChevronRight,
  logout: FiLogOut,
  menu: FiMenu,
  create: FiUserPlus,
}

function Icon({ name, size = 20 }) {
  const IconComponent = icons[name]
  return IconComponent ? <IconComponent aria-hidden="true" size={size} /> : null
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}

function StatCard({ icon, label, value, tint }) {
  return (
    <article className="stat-card">
      <span className={`stat-icon ${tint}`}><Icon name={icon} size={21} /></span>
      <div><p className="stat-label">{label}</p><strong>{value}</strong></div>
    </article>
  )
}

function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null
  return (
    <nav className="pagination" aria-label="Pagination">
      <span>Page {page + 1} of {pages}</span>
      <div>
        <button className="page-button" aria-label="Previous page" disabled={page === 0} onClick={() => onChange(page - 1)}>‹</button>
        <button className="page-button" aria-label="Next page" disabled={page >= pages - 1} onClick={() => onChange(page + 1)}>›</button>
      </div>
    </nav>
  )
}

function EmptyState({ children }) {
  return <div className="empty-state">{children}</div>
}

function CreateAdminForm({ token }) {
  const [values, setValues] = useState({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [requestError, setRequestError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setRequestError('')
    setSuccess('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateRegistration(values)
    setErrors(nextErrors)
    setRequestError('')
    setSuccess('')
    if (Object.keys(nextErrors).length) return

    setSaving(true)
    try {
      const created = await api.createAdmin(token, {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phoneNumber: values.phoneNumber.trim(),
        password: values.password,
      })
      setSuccess(`Administrator account created for ${created.fullName || created.email || values.email}.`)
      setValues({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' })
    } catch (error) {
      setRequestError(error.message || 'The administrator account could not be created.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="panel admin-create-panel">
      <div className="panel-heading"><div><h2>New administrator</h2><p>Create a secure administrator account.</p></div></div>
      <div className="admin-create-body">
        {requestError && <div className="alert alert-error" role="alert">{requestError}</div>}
        {success && <div className="auth-notice" role="status">{success}</div>}
        <form className="admin-create-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-field" htmlFor="admin-name">Full name<input id="admin-name" value={values.fullName} maxLength={150} onChange={(event) => updateField('fullName', event.target.value)} aria-invalid={Boolean(errors.fullName)} />{errors.fullName && <span className="field-error">{errors.fullName}</span>}</label>
          <label className="auth-field" htmlFor="admin-email">Email address<input id="admin-email" type="email" value={values.email} maxLength={255} onChange={(event) => updateField('email', event.target.value)} aria-invalid={Boolean(errors.email)} />{errors.email && <span className="field-error">{errors.email}</span>}</label>
          <label className="auth-field" htmlFor="admin-phone">Phone number<input id="admin-phone" type="tel" placeholder="+255712345678" value={values.phoneNumber} onChange={(event) => updateField('phoneNumber', event.target.value)} aria-invalid={Boolean(errors.phoneNumber)} />{errors.phoneNumber && <span className="field-error">{errors.phoneNumber}</span>}</label>
          <label className="auth-field" htmlFor="admin-password">Password<input id="admin-password" type="password" minLength={8} maxLength={72} value={values.password} onChange={(event) => updateField('password', event.target.value)} aria-invalid={Boolean(errors.password)} />{errors.password && <span className="field-error">{errors.password}</span>}</label>
          <label className="auth-field" htmlFor="admin-confirm-password">Confirm password<input id="admin-confirm-password" type="password" value={values.confirmPassword} onChange={(event) => updateField('confirmPassword', event.target.value)} aria-invalid={Boolean(errors.confirmPassword)} />{errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}</label>
          <button className="auth-submit" type="submit" disabled={saving}>{saving ? 'Creating administrator…' : 'Create administrator'}</button>
        </form>
      </div>
    </section>
  )
}

function AdminDashboard() {
  const { accessToken: token, logout, isSuperAdmin } = useAuth()
  const [activeView, setActiveView] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.localStorage.getItem('minibanking.adminSidebarCollapsed') === 'true')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [usersPage, setUsersPage] = useState(0)
  const [accountsPage, setAccountsPage] = useState(0)
  const [users, setUsers] = useState(null)
  const [accounts, setAccounts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!token) return undefined
    let cancelled = false
    Promise.all([
      api.getUsers(token, usersPage, PAGE_SIZE),
      api.getAccounts(token, accountsPage, PAGE_SIZE),
    ]).then(([userResponse, accountResponse]) => {
      if (cancelled) return
      setUsers(userResponse)
      setAccounts(accountResponse)
    }).catch((requestError) => {
      if (cancelled) return
      if (requestError instanceof AdminApiError && requestError.status === 401) {
        logout()
      } else if (requestError instanceof AdminApiError && requestError.status === 403) {
        setError('Your account is signed in, but it does not have administrator access.')
      } else {
        setError(requestError.message || 'The dashboard could not load. Please try again.')
      }
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [logout, token, usersPage, accountsPage])

  const userRows = Array.isArray(users?.content) ? users.content : EMPTY_ROWS
  const accountRows = Array.isArray(accounts?.content) ? accounts.content : EMPTY_ROWS
  const pageBalance = accountRows.reduce((total, account) => total + (Number(account.balance) || 0), 0)
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return userRows
    return userRows.filter((user) => [user.fullName, user.email, user.phoneNumber, user.role].some((value) => String(value || '').toLowerCase().includes(query)))
  }, [search, userRows])
  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return accountRows
    return accountRows.filter((account) => [account.accountHolderName, account.email, account.accountNumber].some((value) => String(value || '').toLowerCase().includes(query)))
  }, [search, accountRows])

  function changeUsersPage(page) {
    setError('')
    setLoading(true)
    setUsersPage(page)
  }

  function changeAccountsPage(page) {
    setError('')
    setLoading(true)
    setAccountsPage(page)
  }

  function handleLogout() {
    logout()
    setUsers(null)
    setAccounts(null)
    setSearch('')
    setError('')
  }

  if (!token) return null

  const isUsers = activeView === 'users'
  const isAccounts = activeView === 'accounts'
  const isCreateAdmin = activeView === 'create-admin'

  function toggleSidebar() {
    const nextCollapsed = !sidebarCollapsed
    setSidebarCollapsed(nextCollapsed)
    window.localStorage.setItem('minibanking.adminSidebarCollapsed', String(nextCollapsed))
  }

  return (
    <div className={`admin-app${sidebarCollapsed ? ' is-sidebar-collapsed' : ''}`}>
      <aside className={`sidebar${mobileNavOpen ? ' mobile-open' : ''}`}>
        <a className="brand" href="#overview" onClick={() => { setActiveView('overview'); setMobileNavOpen(false) }}><span className="brand-mark">M</span><span>Minibank<span className="brand-sub">ADMIN PORTAL</span></span></a>
        <nav className="side-nav" aria-label="Admin navigation">
          <button aria-label="Overview" title="Overview" className={activeView === 'overview' ? 'nav-item active' : 'nav-item'} onClick={() => { setActiveView('overview'); setSearch(''); setMobileNavOpen(false) }}><Icon name="grid" /><span>Overview</span></button>
          <button aria-label="Customers" title="Customers" className={isUsers ? 'nav-item active' : 'nav-item'} onClick={() => { setActiveView('users'); setSearch(''); setMobileNavOpen(false) }}><Icon name="people" /><span>Customers</span></button>
          <button aria-label="Accounts" title="Accounts" className={isAccounts ? 'nav-item active' : 'nav-item'} onClick={() => { setActiveView('accounts'); setSearch(''); setMobileNavOpen(false) }}><Icon name="wallet" /><span>Accounts</span></button>
          {isSuperAdmin && <button aria-label="Create administrator" title="Create administrator" className={isCreateAdmin ? 'nav-item active' : 'nav-item'} onClick={() => { setActiveView('create-admin'); setMobileNavOpen(false) }}><Icon name="create" /><span>Create administrator</span></button>}
        </nav>
        <div className="sidebar-footer"><button aria-label="Sign out" title="Sign out" className="nav-item logout-button" onClick={handleLogout}><Icon name="logout" /><span>Sign out</span></button></div>
      </aside>
      {mobileNavOpen && <button className="admin-backdrop" type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}

      <main className="main-area">
        <header className="topbar">
          <button className="sidebar-toggle" type="button" onClick={toggleSidebar} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!sidebarCollapsed}><Icon name="menu" /></button>
          <button className="mobile-menu" type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Icon name="menu" /></button>
          <div className="breadcrumb"><strong>{isUsers ? 'Customers' : isAccounts ? 'Accounts' : isCreateAdmin ? 'Create administrator' : 'Overview'}</strong></div>
          <div className="topbar-actions"><span className="admin-avatar">A</span><div className="admin-label"><strong>Administrator</strong><span>Bank operations</span></div></div>
        </header>

        <div className="content-wrap">
          <div className="page-heading">
            <div><p className="eyebrow">BANK OPERATIONS</p><h1>{isUsers ? 'Customers' : isAccounts ? 'Accounts' : isCreateAdmin ? 'Create administrator' : 'Overview'}</h1><p className="muted">{isUsers ? 'Review registered customers from your banking system.' : isAccounts ? 'Monitor customer accounts and current balances.' : isCreateAdmin ? 'Provision access for a new administrator.' : 'A summary of your banking system.'}</p></div>
          </div>

          {error && <div className="alert alert-error" role="alert"><span>{error}</span><button onClick={() => setError('')}>Dismiss</button></div>}

          <section className="stats-grid" aria-label="Banking summary">
            <StatCard icon="people" tint="purple" label="Registered customers" value={users ? Number(users.totalElements || 0).toLocaleString() : '—'} />
            <StatCard icon="wallet" tint="blue" label="Bank accounts" value={accounts ? Number(accounts.totalElements || 0).toLocaleString() : '—'} />
            <StatCard icon="arrow" tint="green" label="Balance on this page" value={accounts ? formatCurrency(pageBalance) : '—'} />
          </section>

          {loading && <div className="loading-bar" role="status">Refreshing live data…</div>}

          {activeView === 'overview' && (
            <section className="panel overview-panel">
              <div className="panel-heading"><div><h2>Account directory</h2><p>Recent account records</p></div><button className="text-button" onClick={() => setActiveView('accounts')}>View all accounts <Icon name="chevron" size={16} /></button></div>
              <AccountTable rows={accountRows.slice(0, 5)} />
            </section>
          )}

          {isUsers && (
            <section className="panel">
              <div className="panel-heading"><div><h2>Customer directory</h2><p>{users ? `${Number(users.totalElements || 0).toLocaleString()} customers in your system` : 'Customer records'}</p></div><SearchBox value={search} onChange={setSearch} placeholder="Search this page" /></div>
              <UserTable rows={filteredUsers} />
              <Pagination page={users?.number ?? usersPage} pages={users?.totalPages ?? 0} onChange={changeUsersPage} />
            </section>
          )}

          {isAccounts && (
            <section className="panel">
              <div className="panel-heading"><div><h2>Account directory</h2><p>{accounts ? `${Number(accounts.totalElements || 0).toLocaleString()} accounts in your system` : 'Account records'}</p></div><SearchBox value={search} onChange={setSearch} placeholder="Search this page" /></div>
              <AccountTable rows={filteredAccounts} />
              <Pagination page={accounts?.number ?? accountsPage} pages={accounts?.totalPages ?? 0} onChange={changeAccountsPage} />
            </section>
          )}

          {isCreateAdmin && isSuperAdmin && <CreateAdminForm token={token} />}
        </div>
      </main>
    </div>
  )
}

function SearchBox({ value, onChange, placeholder }) {
  return <label className="search-box"><Icon name="search" size={18} /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} /></label>
}

function UserTable({ rows }) {
  if (!rows.length) return <EmptyState>No customer records match this search.</EmptyState>
  return (
    <div className="table-scroll"><table><thead><tr><th>Customer</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead><tbody>
      {rows.map((user) => <tr key={user.userId}><td><div className="person-cell"><span className="person-avatar">{(user.fullName || user.email || '?').slice(0, 1).toUpperCase()}</span><span><strong>{user.fullName || 'Unnamed customer'}</strong><small>{user.email || 'No email provided'}</small></span></div></td><td>{user.phoneNumber || '—'}</td><td><span className="role-pill">{user.role || 'Customer'}</span></td><td>{formatDate(user.createdAt)}</td></tr>)}
    </tbody></table></div>
  )
}

function AccountTable({ rows }) {
  if (!rows.length) return <EmptyState>No account records are available.</EmptyState>
  return (
    <div className="table-scroll"><table><thead><tr><th>Account holder</th><th>Account number</th><th>Balance</th><th>Created</th></tr></thead><tbody>
      {rows.map((account) => <tr key={account.accountId}><td><div className="person-cell"><span className="person-avatar avatar-blue">{(account.accountHolderName || account.email || '?').slice(0, 1).toUpperCase()}</span><span><strong>{account.accountHolderName || 'Unnamed account holder'}</strong><small>{account.email || `Customer #${account.userId ?? '—'}`}</small></span></div></td><td><span className="account-number">{account.accountNumber || '—'}</span></td><td><strong className="balance-value">{formatCurrency(account.balance)}</strong></td><td>{formatDate(account.createdAt)}</td></tr>)}
    </tbody></table></div>
  )
}

export default AdminDashboard
