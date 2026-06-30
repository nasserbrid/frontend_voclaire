import type { LoginRequest, RegisterRequest, UserOut } from '../types'

const BASE_URL = import.meta.env.VITE_BACKEND_VOCLAIRE_URL as string

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body?.detail ?? `Erreur ${response.status}`)
  }
  return response.json() as Promise<T>
}

export async function register(data: RegisterRequest, acceptedTerms: boolean): Promise<UserOut> {
  return request<UserOut>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ ...data, accepted_terms: acceptedTerms }),
  })
}

export async function login(data: LoginRequest): Promise<UserOut> {
  return request<UserOut>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function logout(): Promise<void> {
  await request<void>('/auth/logout', { method: 'POST' })
}

export async function getMe(): Promise<UserOut> {
  return request<UserOut>('/users/me')
}

export async function acceptTerms(): Promise<void> {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_VOCLAIRE_URL}/users/me/accept-terms`,
    { method: 'POST', credentials: 'include' }
  )
  if (!res.ok) throw new Error('Erreur acceptation CGU')
}
