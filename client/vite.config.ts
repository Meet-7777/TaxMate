import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Load env from the client directory so VITE_* vars are available here
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const proxyTarget = env.VITE_API_PROXY_TARGET ?? 'http://localhost:8080'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': `${import.meta.dirname}/src`,
      },
    },
    server: {
      proxy: {
        '/auth': proxyTarget,
        '/me': proxyTarget,
        '/health': proxyTarget,
      },
    },
  }
})
