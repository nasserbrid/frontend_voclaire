import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { getMe, logout as apiLogout } from '../api/auth'
import type { UserOut } from '../types'

interface AuthContextValue {
  user: UserOut | null
  loading: boolean
  setUser: (user: UserOut | null) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null)
  const [loading, setLoading] = useState(true)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  function logout() {
    apiLogout().catch(() => {})
    setUser(null)
  }

  async function refreshUser() {
    const updated = await getMe()
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}
