import api from './client'

export type WorkType =
  | 'uber'
  | 'didi'
  | 'ubereats'
  | 'doordash'
  | 'menulog'
  | 'casual_employee'
  | 'freelancer'
  | 'tradie'
  | 'other'

export type User = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  abn: string | null
  work_type: WorkType | null
  needs_bas: boolean
  profile_completed: boolean
}

export type DeviceType = 'mobile' | 'laptop'

export type UpdateProfilePayload = {
  first_name: string
  last_name: string
  phone: string
  abn: string
  work_type: WorkType
  needs_bas: boolean
}

// POST /api/auth/signup — Returns { id, email } on 201. Does NOT set auth cookies.
export async function signup(email: string, password: string): Promise<{ id: string; email: string }> {
  const { data } = await api.post<{ id: string; email: string }>('/api/auth/signup', { email, password })
  return data
}

// POST /api/auth/login — Sets access_token + refresh_token cookies on success.
export async function login(
  email: string,
  password: string,
): Promise<{ id: string; email: string }> {
  const { data } = await api.post<{ id: string; email: string }>('/api/auth/login', {
    email,
    password,
  })
  return data
}

// POST /api/auth/refresh — Rotates cookies using the existing refresh_token cookie.
export async function refresh(): Promise<void> {
  await api.post('/api/auth/refresh')
}

// POST /api/auth/logout — Expires both auth cookies on the server.
export async function logout(): Promise<void> {
  await api.post('/api/auth/logout')
}

// POST /api/auth/change-password (protected)
export async function changePassword(
  old_password: string,
  new_password: string,
): Promise<void> {
  await api.post('/api/auth/change-password', { old_password, new_password })
}

// GET /api/me (protected) — Returns the full user profile.
export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/api/me')
  return data
}

// PATCH /api/me/profile (protected) — Saves onboarding profile data.
export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await api.patch<User>('/api/me/profile', payload)
  return data
}
