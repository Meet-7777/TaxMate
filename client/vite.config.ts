import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
  server: {
    proxy: {
      '/auth': 'http://localhost:8080',
      '/me': 'http://localhost:8080',
      '/health': 'http://localhost:8080',
    },
  },
})
