import { useEffect, useState } from 'react'
import { FiCalendar, FiFilter, FiRefreshCw } from 'react-icons/fi'
import AuthenticatedLayout from '../components/AuthenticatedLayout.jsx'
import { transactionService } from '../services/transactionService.js'
import { formatCurrency, formatDateTime, formatTransactionType, getTransactionDirection } from '../../utils/formatters.js'
import '../../user_styles/transactions.css'

const INITIAL_FILTERS = { type: '', from: '', to: '' }
const INITIAL_PAGE = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }
const PAGE_SIZES = [10, 20, 50]

function toDateTimeBoundary(date, endOfDay) {
  if (!date) return ''
  return new Date(`${date}T${endOfDay ? '23:59:59.999' : '00:00:00'}`).toISOString()
}

function HistoryRows({ transactions, loading, error }) {
  if (loading) return <div className="history-loading" role="status">Loading transactions…</div>
  if (error) return <div className="history-empty"><strong>Transactions unavailable</strong><p>Try refreshing the request.</p></div>
  if (!transactions.length) return <div className="history-empty"><strong>No transactions found</strong><p>Try changing the filters or check back after your next account transaction.</p></div>

  return (
    <div className="history-table-scroll">
      <table className="history-table">
        <thead><tr><th scope="col">Transaction</th><th scope="col">Date and time</th><th scope="col">Amount</th><th scope="col">Balance after</th></tr></thead>
        <tbody>{transactions.map((transaction) => {
          const direction = getTransactionDirection(transaction.type)
          return <tr key={transaction.id}>
            <td><span className={`history-type-pill ${direction}`}>{formatTransactionType(transaction.type)}</span><small className="history-id">ID {transaction.id}</small></td>
            <td>{formatDateTime(transaction.createdAt)}</td>
            <td className={direction === 'incoming' ? 'history-amount-in' : 'history-amount-out'}>{direction === 'incoming' ? '+' : '−'}{formatCurrency(transaction.amount)}</td>
            <td>{transaction.balanceAfter === undefined || transaction.balanceAfter === null ? 'N/A' : formatCurrency(transaction.balanceAfter)}</td>
          </tr>
        })}</tbody>
      </table>
    </div>
  )
}

export default function TransactionHistoryPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS)
  const [filterError, setFilterError] = useState('')
  const [pageNumber, setPageNumber] = useState(0)
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0])
  const [history, setHistory] = useState(INITIAL_PAGE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestKey, setRequestKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    transactionService.getHistory({
      page: pageNumber,
      size: pageSize,
      type: appliedFilters.type,
      from: toDateTimeBoundary(appliedFilters.from, false),
      to: toDateTimeBoundary(appliedFilters.to, true),
    }).then((response) => {
      if (cancelled) return
      setHistory({
        content: Array.isArray(response?.content) ? response.content : [],
        page: Number(response?.page ?? pageNumber),
        size: Number(response?.size ?? pageSize),
        totalElements: Number(response?.totalElements || 0),
        totalPages: Number(response?.totalPages || 0),
      })
      setError('')
    }).catch((requestError) => {
      if (!cancelled) {
        setHistory(INITIAL_PAGE)
        setError(requestError.message || 'Transaction history could not be loaded.')
      }
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [appliedFilters, pageNumber, pageSize, requestKey])

  function applyFilters(event) {
    event.preventDefault()
    if (filters.from && filters.to && filters.from > filters.to) {
      setFilterError('The start date must be on or before the end date.')
      return
    }
    setFilterError('')
    setLoading(true)
    setError('')
    setPageNumber(0)
    setAppliedFilters({ ...filters })
  }

  function clearFilters() {
    setFilters(INITIAL_FILTERS)
    setAppliedFilters({ ...INITIAL_FILTERS })
    setFilterError('')
    setLoading(true)
    setError('')
    setPageNumber(0)
  }

  function changePage(nextPage) {
    setLoading(true)
    setError('')
    setPageNumber(nextPage)
  }

  function changePageSize(event) {
    setLoading(true)
    setError('')
    setPageSize(Number(event.target.value))
    setPageNumber(0)
  }

  function retry() {
    setLoading(true)
    setError('')
    setRequestKey((current) => current + 1)
  }

  const rows = loading || error ? [] : history.content
  const startRecord = history.totalElements === 0 ? 0 : pageNumber * pageSize + 1
  const endRecord = Math.min((pageNumber + 1) * pageSize, history.totalElements)

  return (
    <AuthenticatedLayout>
      <section className="dashboard-heading">
        <div><span className="dashboard-eyebrow">ACCOUNT ACTIVITY</span><h1>Transaction history</h1><p>Review deposits, withdrawals, and transfers on your account.</p></div>
        <button className="dashboard-refresh" type="button" onClick={retry} disabled={loading}><FiRefreshCw aria-hidden="true" /> Refresh</button>
      </section>

      <section className="history-panel" aria-label="Transaction history">
        <form className="history-filters" onSubmit={applyFilters}>
          <label className="history-filter-field">Transaction type<select value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}><option value="">All types</option><option value="DEPOSIT">Deposit</option><option value="WITHDRAWAL">Withdrawal</option><option value="TRANSFER_IN">Transfer received</option><option value="TRANSFER_OUT">Transfer sent</option></select></label>
          <label className="history-filter-field">From date<span className="date-filter-input"><FiCalendar aria-hidden="true" /><input type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} /></span></label>
          <label className="history-filter-field">To date<span className="date-filter-input"><FiCalendar aria-hidden="true" /><input type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} /></span></label>
          <div className="history-filter-actions"><button className="history-apply" type="submit"><FiFilter aria-hidden="true" /> Apply filters</button><button className="history-clear" type="button" onClick={clearFilters}>Clear</button></div>
          {filterError && <span className="field-error history-filter-error" role="alert">{filterError}</span>}
        </form>

        {error && <div className="dashboard-error history-error" role="alert"><span>{error}</span><button type="button" onClick={retry}>Try again</button></div>}
        <div className="history-results-heading"><div><h2>All transactions</h2><p>{loading ? 'Loading transaction records…' : `${history.totalElements.toLocaleString()} transactions found`}</p></div><label className="history-page-size">Rows<select value={pageSize} onChange={changePageSize}>{PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}</select></label></div>
        <HistoryRows transactions={rows} loading={loading} error={error} />
        <div className="history-pagination"><span>{loading ? ' ' : `Showing ${startRecord}–${endRecord} of ${history.totalElements}`}</span><div><button type="button" onClick={() => changePage(pageNumber - 1)} disabled={loading || pageNumber <= 0} aria-label="Previous page">Previous</button><span>Page {pageNumber + 1} of {Math.max(history.totalPages, 1)}</span><button type="button" onClick={() => changePage(pageNumber + 1)} disabled={loading || pageNumber + 1 >= history.totalPages} aria-label="Next page">Next</button></div></div>
      </section>
    </AuthenticatedLayout>
  )
}
