import { apiRequest } from './apiClient.js'

export const transactionService = {
  getHistory({ page, size, type, from, to }) {
    const query = new URLSearchParams({ page: String(page), size: String(size) })
    if (type) query.set('type', type)
    if (from) query.set('from', from)
    if (to) query.set('to', to)
    return apiRequest(`/api/account/transactions?${query.toString()}`, { authenticated: true })
  },

  deposit(amount) {
    return apiRequest('/api/account/deposit', {
      method: 'POST',
      body: { amount },
      authenticated: true,
    })
  },

  withdraw(amount) {
    return apiRequest('/api/account/withdraw', {
      method: 'POST',
      body: { amount },
      authenticated: true,
    })
  },

  transfer(recipientAccountNumber, amount) {
    return apiRequest('/api/account/transfer', {
      method: 'POST',
      body: { recipientAccountNumber, amount },
      authenticated: true,
    })
  },
}
