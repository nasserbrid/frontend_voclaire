import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SttForm from '../components/SttForm'
import { getTranscriptions, deleteTranscription, improveTranscription } from '../api/transcriptions'
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
  const [improvingId, setImprovingId] = useState<string | null>(null)
  const [modeMap, setModeMap] = useState<Record<string, string>>({})
  const [errorMap, setErrorMap] = useState<Record<string, string>>({})

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

  async function handleDelete(id: string) {
    const previous = history
    setHistory((h) => h.filter((t) => t.id !== id))
    try {
      await deleteTranscription(id)
    } catch {
      setHistory(previous)
    }
  }

  async function handleImprove(id: string) {
    if (improvingId) return
    const mode = modeMap[id] ?? 'correction'
    setImprovingId(id)
    setErrorMap((prev) => ({ ...prev, [id]: '' }))
    try {
      const updated = await improveTranscription(id, mode)
      setHistory((prev) => prev.map((item) => (item.id === id ? updated : item)))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de l\'amélioration'
      setErrorMap((prev) => ({ ...prev, [id]: msg }))
    } finally {
      setImprovingId(null)
    }
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
              {history.map((t) => {
                const isImproving = improvingId === t.id
                const selectedMode = modeMap[t.id] ?? 'correction'
                const error = errorMap[t.id] ?? ''

                return (
                  <div
                    key={t.id}
                    style={{ background: 'linear-gradient(180deg,#0b1020,#080b16)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px 22px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                        {t.file_name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                          {new Date(t.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <button
                          onClick={() => handleDelete(t.id)}
                          style={{ fontSize: '12px', color: '#6b7280', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Manrope', sans-serif", fontWeight: 500, transition: 'color 0.15s, border-color 0.15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>

                    <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0, lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {t.text}
                    </p>

                    {t.improved_text && (
                      <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '14px', marginTop: '10px' }}>
                        <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Texte amélioré
                        </div>
                        <p style={{ fontSize: '14px', color: '#d1fae5', margin: 0, lineHeight: 1.6 }}>
                          {t.improved_text}
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
                      <select
                        value={selectedMode}
                        onChange={(e) => setModeMap((prev) => ({ ...prev, [t.id]: e.target.value }))}
                        style={{ background: '#0b1020', border: '1px solid rgba(255,255,255,0.12)', color: '#e5e7eb', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', fontFamily: "'Manrope', sans-serif", cursor: 'pointer' }}
                      >
                        <option value="correction">Correction</option>
                        <option value="reformulation">Reformulation</option>
                        <option value="résumé">Résumé</option>
                      </select>
                      <button
                        onClick={() => handleImprove(t.id)}
                        disabled={isImproving}
                        style={{ background: 'linear-gradient(135deg,#10b981,#34d399)', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 16px', fontSize: '13px', fontFamily: "'Manrope', sans-serif", fontWeight: 600, cursor: isImproving ? 'not-allowed' : 'pointer', opacity: isImproving ? 0.5 : 1 }}
                      >
                        {isImproving ? 'En cours…' : 'Améliorer'}
                      </button>
                    </div>

                    {error && (
                      <p style={{ fontSize: '13px', color: '#f87171', margin: '6px 0 0' }}>
                        {error}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
