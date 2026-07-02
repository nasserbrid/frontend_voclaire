import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { submitContact } from '../api/contact'

export default function ContactPage() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const canSubmit = subject.trim().length > 0 && message.trim().length >= 10 && !loading

  async function handleSubmit() {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      await submitContact(subject.trim(), message.trim())
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi du message")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#030712', color: '#e5e7eb', fontFamily: "'Manrope', sans-serif", minHeight: '100vh' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)', background: 'rgba(3,7,18,0.72)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'linear-gradient(140deg,#10b981,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}>
              <div style={{ width: '8px', height: '14px', background: '#fff', borderRadius: '4px' }} />
            </div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '19px', letterSpacing: '-0.02em', color: '#fff' }}>voclaire</span>
          </div>
          <Link
            to="/app"
            style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'none', fontWeight: 500 }}
          >
            ← Retour
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#34d399', marginBottom: '10px' }}>Contact</div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '32px', letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>
            Nous contacter
          </h1>
        </div>

        <div style={{ background: 'linear-gradient(180deg,#0b1020,#080b16)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontSize: '16px', color: '#34d399', fontWeight: 600, marginBottom: '20px' }}>
                Message envoyé ! Nasser vous répondra par email.
              </p>
              <button
                onClick={() => navigate('/app')}
                style={{ padding: '13px 26px', borderRadius: '12px', border: 'none', fontFamily: "'Manrope', sans-serif", fontSize: '15px', fontWeight: 700, cursor: 'pointer', background: '#10b981', color: '#fff', boxShadow: '0 8px 24px rgba(16,185,129,0.4)' }}
              >
                Retour à l'application
              </button>
            </div>
          ) : (
            <>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>
                Sujet
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value.slice(0, 100))}
                maxLength={100}
                placeholder="Objet de votre message"
                style={{ width: '100%', background: '#05070f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#e5e7eb', fontFamily: "'Manrope', sans-serif", fontSize: '14px', padding: '12px 14px', outline: 'none', boxSizing: 'border-box', marginBottom: '20px' }}
              />

              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                placeholder="Décrivez votre demande… (10 à 1000 caractères)"
                maxLength={1000}
                rows={6}
                style={{ width: '100%', background: '#05070f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#e5e7eb', fontFamily: "'Manrope', sans-serif", fontSize: '14px', lineHeight: 1.6, padding: '12px 14px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
              />
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#6b7280', fontWeight: 500, marginTop: '6px', marginBottom: '20px' }}>
                {message.length}/1000
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px', borderRadius: '12px', border: 'none', fontFamily: "'Manrope', sans-serif", fontSize: '15px', fontWeight: 700, cursor: canSubmit ? 'pointer' : 'not-allowed', background: canSubmit ? '#10b981' : 'rgba(16,185,129,0.4)', color: '#fff', boxShadow: canSubmit ? '0 8px 24px rgba(16,185,129,0.4)' : 'none' }}
              >
                {loading && (
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '999px', display: 'inline-block', animation: 'vc-spin 0.7s linear infinite' }} />
                )}
                {loading ? 'Envoi en cours…' : 'Envoyer'}
              </button>

              {error && (
                <div style={{ marginTop: '14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500 }}>
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
