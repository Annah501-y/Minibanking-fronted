import { apiRequest } from './apiClient.js'

export const authService = {
  login(credentials) {
    return apiRequest('/api/auth/login', { method: 'POST', body: credentials })
  },

  getCurrentRole() {
    return apiRequest('/api/auth/me', { authenticated: true })
  },

  register(registration) {
    return apiRequest('/api/auth/register', { method: 'POST', body: registration })
  },
}
