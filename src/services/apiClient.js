const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const AUTH_TOKEN_KEY = 'minibanking.accessToken'

/** API error with HTTP status and parsed backend response for user-facing handling. */
export class ApiError extends Error {
  constructor(message, { status = 0, payload = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

function publishUnauthorized() {
  window.dispatchEvent(new Event('auth:unauthorized'))
}

async function parseResponse(response) {
  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return response.json()
  const body = await response.text()
  return body || null
}

/** Make same-origin /api requests through Vite's proxy in development. */
export async function apiRequest(path, { method = 'GET', body, headers = {}, authenticated = false, signal } = {}) {
  const requestHeaders = new Headers(headers)
  if (body !== undefined) requestHeaders.set('Content-Type', 'application/json')

  if (authenticated) {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY)
    if (token) requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError('Unable to connect to the banking service. Check that the API is running and try again.')
  }

  const payload = await parseResponse(response)
  if (!response.ok) {
    if (response.status === 401 && authenticated) publishUnauthorized()
    throw new ApiError(getApiErrorMessage(payload, response.status), { status: response.status, payload })
  }

  return payload
}

export function getApiErrorMessage(payload, status) {
  if (typeof payload === 'string' && payload.trim()) return payload
  if (payload && typeof payload === 'object') {
    const directMessage = payload.message || payload.detail || payload.title || payload.error_description
    if (directMessage) return directMessage

    if (Array.isArray(payload.errors) && payload.errors.length) {
      return payload.errors.map((item) => {
        if (typeof item === 'string') return item
        return item?.defaultMessage || item?.message || item?.detail || ''
      }).filter(Boolean).join(' ')
    }

    if (payload.errors && typeof payload.errors === 'object') {
      return Object.values(payload.errors).flat().map((item) => {
        if (typeof item === 'string') return item
        return item?.defaultMessage || item?.message || ''
      }).filter(Boolean).join(' ')
    }
  }

  return status ? `The request could not be completed (HTTP ${status}).` : 'The request could not be completed.'
}
