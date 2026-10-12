// In development, the empty base URL lets Vite proxy /api to Spring Boot.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

/** Holds API status so the UI can distinguish authentication failures from service errors. */
export class AdminApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'AdminApiError'
    this.status = status
  }
}

async function request(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers || {})
  if (options.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  } catch {
    throw new AdminApiError('Could not reach the banking API. Check that Spring Boot is running and the API URL is correct.')
  }

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : null
  if (!response.ok) {
    if (response.status === 401) window.dispatchEvent(new Event('auth:unauthorized'))
    const message = payload?.message || payload?.detail || payload?.error || `Request failed with status ${response.status}.`
    throw new AdminApiError(message, response.status)
  }
  return payload
}

function pagePath(path, page, size) {
  const query = new URLSearchParams({ page: String(page), size: String(size) })
  return `${path}?${query.toString()}`
}

export const api = {
  getUsers(token, page, size) {
    return request(pagePath('/api/admin/users', page, size), { token })
  },
  getAccounts(token, page, size) {
    return request(pagePath('/api/admin/accounts', page, size), { token })
  },
  createAdmin(token, details) {
    return request('/api/admin/admins', {
      token,
      method: 'POST',
      body: JSON.stringify(details),
    })
  },
}
