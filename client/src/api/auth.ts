import api from './client'

export type User = {
  id: string
  email: string
}

export type MeResponse = {
  id: string
}

export type DeviceType = 'mobile' | 'laptop'

// POST /auth/signup
// Returns { id, email } on 201. Does NOT set auth cookies.
export async function signup(email: string, password: string): Promise<User> {
  const { data } = await api.post<User>('/auth/signup', { email, password })
  return data
}

// POST /auth/login
// Sets access_token + refresh_token cookies on success.
export async function login(
  email: string,
  password: string,
  device_type: DeviceType,
): Promise<User> {
  const { data } = await api.post<User>('/auth/login', {
    email,
    password,
    device_type,
  })
  return data
}

// POST /auth/refresh
// Rotates cookies using the existing refresh_token cookie.
export async function refresh(): Promise<void> {
  await api.post('/auth/refresh')
}

// POST /auth/logout
// Expires both auth cookies on the server. Always call this before clearing local state.
export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

// POST /auth/change-password (protected)
// Verifies old password, then replaces with new password.
export async function changePassword(
  old_password: string,
  new_password: string,
): Promise<void> {
  await api.post('/auth/change-password', { old_password, new_password })
}

// GET /me
// Returns the current user's id from the access_token cookie.
export async function getMe(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>('/me')
  return data
}
