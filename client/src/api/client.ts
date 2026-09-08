import axios, { type AxiosError } from 'axios'

// All auth is cookie-based — no Authorization header needed.
// withCredentials ensures the browser sends HttpOnly cookies on every request.
// VITE_API_BASE_URL defaults to '/' so the Vite dev proxy handles routing.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
let refreshSubscribers: Array<(success: boolean) => void> = []

function subscribeToRefresh(cb: (success: boolean) => void) {
  refreshSubscribers.push(cb)
}

function notifySubscribers(success: boolean) {
  refreshSubscribers.forEach((cb) => cb(success))
  refreshSubscribers = []
}

// Intercept 401s: attempt a silent token refresh once, then retry the
// original request. If refresh fails, reject everything and clear state.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config) & { _retry?: boolean }

    // Don't retry refresh requests themselves to avoid infinite loops.
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Queue this request until the ongoing refresh completes.
        return new Promise((resolve, reject) => {
          subscribeToRefresh((success) => {
            if (success) {
              resolve(api(original))
            } else {
              reject(error)
            }
          })
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        await api.post('/auth/refresh')
        isRefreshing = false
        notifySubscribers(true)
        return api(original)
      } catch {
        isRefreshing = false
        notifySubscribers(false)
        // Dispatch a custom event so AuthContext can clear user state.
        window.dispatchEvent(new Event('auth:logout'))
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

export default api
