import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../context/AuthContext'

const BACKEND_URL = import.meta.env.VITE_BACKEND_VOCLAIRE_URL as string

export default function LoginPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const user = await login({ email, password })
      setUser(user)
      navigate('/app', { state: { toast: 'Vous êtes connecté.' } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#030712' }}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif', color: '#10b981' }}>
            voclaire
          </span>
          <p className="mt-2 text-gray-400" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Connectez-vous à votre compte
          </p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-400" style={{ fontFamily: 'Manrope, sans-serif' }}>Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="rounded-xl px-4 py-3 text-white outline-none focus:ring-2"
                style={{ background: '#1e293b', border: '1px solid #334155', fontFamily: 'Manrope, sans-serif', focusRingColor: '#10b981' }}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-400" style={{ fontFamily: 'Manrope, sans-serif' }}>Mot de passe</span>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="rounded-xl px-4 py-3 text-white outline-none"
                style={{ background: '#1e293b', border: '1px solid #334155', fontFamily: 'Manrope, sans-serif' }}
              />
            </label>

            {error && (
              <p className="text-sm text-red-400" style={{ fontFamily: 'Manrope, sans-serif' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl py-3 font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: '#10b981', fontFamily: 'Manrope, sans-serif' }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: '#1e293b' }} />
            <span className="text-xs text-gray-500">ou</span>
            <div className="flex-1 h-px" style={{ background: '#1e293b' }} />
          </div>

          <button
            onClick={() => {
              sessionStorage.setItem('vc:oauth_pending', '1')
              window.location.href = `${BACKEND_URL}/auth/google`
            }}
            className="w-full rounded-xl py-3 font-semibold text-white transition-opacity hover:opacity-80 flex items-center justify-center gap-3"
            style={{ background: '#1e293b', border: '1px solid #334155', fontFamily: 'Manrope, sans-serif' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>

          <p className="mt-6 text-center text-sm text-gray-500" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-medium" style={{ color: '#10b981' }}>
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
