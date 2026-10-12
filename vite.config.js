import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Keep local API calls on the Vite origin; production uses VITE_API_BASE_URL.
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
