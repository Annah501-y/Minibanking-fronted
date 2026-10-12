import { apiRequest } from './apiClient.js'

const RECENT_ACTIVITY_SIZE = 5

export const accountService = {
  getAccount() {
    return apiRequest('/api/account', { authenticated: true })
  },

  getRecentTransactions() {
    const query = new URLSearchParams({ page: '0', size: String(RECENT_ACTIVITY_SIZE) })
    return apiRequest(`/api/account/transactions?${query}`, { authenticated: true })
  },
}
