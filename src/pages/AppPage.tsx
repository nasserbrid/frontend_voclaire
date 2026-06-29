import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SttForm from '../components/SttForm'

export default function AppPage() {
  'use no memo'
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [toast, setToast] = useState<string | null>(
    (location.state as { toast?: string } | null)?.toast ?? null
  )

  useEffect(() => {
    if (!toast) return
    window.history.replaceState({}, '')
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen" style={{ background: '#030712' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', padding: '14px 28px', borderRadius: 12, fontFamily: 'Manrope, sans-serif', fontSize: 16, fontWeight: 600, boxShadow: '0 4px 24px rgba(0,0,0,0.4)', zIndex: 9999, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid #1e293b' }}
      >
        <span className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: '#10b981' }}>
          voclaire
        </span>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>{user?.email}</p>
            <p className="text-xs text-gray-500 capitalize" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Plan {user?.plan}
              {user?.plan === 'free' && (
                <span className="ml-2 text-emerald-400 cursor-pointer hover:underline">→ Passer Pro</span>
              )}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg"
            style={{ border: '1px solid #334155', fontFamily: 'Manrope, sans-serif' }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1
          className="text-2xl font-bold text-white mb-8"
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          Nouvelle transcription
        </h1>
        <SttForm />
      </main>
    </div>
  )
}
