import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SttForm from '../components/SttForm'
import { getTranscriptions } from '../api/transcriptions'
import type { TranscriptionOut } from '../types/transcription'

export default function AppPage() {
  'use no memo'
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [toast, setToast] = useState<string | null>(
    (location.state as { toast?: string } | null)?.toast ?? null
  )
  const [history, setHistory] = useState<TranscriptionOut[]>([])

  useEffect(() => {
    if (!toast) return
    window.history.replaceState({}, '')
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    getTranscriptions().then(setHistory).catch(() => setHistory([]))
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div style={{ background: '#030712', color: '#e5e7eb', fontFamily: "'Manrope', sans-serif", minHeight: '100vh' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', padding: '14px 28px', borderRadius: 12, fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 600, boxShadow: '0 4px 24px rgba(0,0,0,0.4)', zIndex: 9999, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)', background: 'rgba(3,7,18,0.72)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'linear-gradient(140deg,#10b981,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}>
              <div style={{ width: '8px', height: '14px', background: '#fff', borderRadius: '4px' }} />
            </div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '19px', letterSpacing: '-0.02em', color: '#fff' }}>voclaire</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '14px', color: '#fff', fontWeight: 500, margin: 0 }}>{user?.email}</p>
              <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>
                Plan {user?.plan}
                {user?.plan === 'free' && (
                  <span style={{ marginLeft: '8px', color: '#34d399', cursor: 'pointer' }}>→ Passer Pro</span>
                )}
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{ fontSize: '14px', color: '#9ca3af', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontFamily: "'Manrope', sans-serif", fontWeight: 500 }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#34d399', marginBottom: '10px' }}>Espace de travail</div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '32px', letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>
            Nouvelle transcription
          </h1>
        </div>
        <div style={{ background: 'linear-gradient(180deg,#0b1020,#080b16)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
          <SttForm />
        </div>

        {history.length > 0 && (
          <div style={{ marginTop: '56px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#34d399', marginBottom: '10px' }}>Historique</div>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '22px', letterSpacing: '-0.02em', color: '#fff', margin: '0 0 20px' }}>
              Transcriptions récentes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map((t) => (
                <div
                  key={t.id}
                  style={{ background: 'linear-gradient(180deg,#0b1020,#080b16)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px 22px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                      {t.file_name}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500, flexShrink: 0 }}>
                      {new Date(t.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0, lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {t.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
