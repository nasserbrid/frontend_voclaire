import { useState } from 'react'
import { acceptTerms } from '../api/auth'

interface TermsModalProps {
  onAccepted: () => void
}

export default function TermsModal({ onAccepted }: TermsModalProps) {
  const [cguAccepted, setCguAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [loading, setLoading] = useState(false)

  const canSubmit = cguAccepted && privacyAccepted

  async function handleAccept() {
    if (!canSubmit || loading) return
    setLoading(true)
    try {
      await acceptTerms()
      onAccepted()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '40px 36px', maxWidth: '480px', width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(140deg,#10b981,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: '8px', height: '14px', background: '#fff', borderRadius: '4px' }} />
          </div>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '18px', color: '#fff' }}>voclaire</span>
        </div>

        <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '22px', color: '#fff', margin: '0 0 10px' }}>
          Avant de commencer
        </h2>
        <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6, margin: '0 0 28px', fontFamily: "'Manrope', sans-serif" }}>
          Merci de lire et d'accepter nos documents avant d'accéder à voclaire.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={cguAccepted}
              onChange={(e) => setCguAccepted(e.target.checked)}
              style={{ marginTop: '2px', accentColor: '#10b981', width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', color: '#d1d5db', lineHeight: 1.6, fontFamily: "'Manrope', sans-serif" }}>
              J'ai lu et j'accepte les{' '}
              <a href="/cgu" target="_blank" rel="noopener noreferrer" style={{ color: '#34d399', textDecoration: 'underline' }}>
                Conditions Générales d'Utilisation
              </a>
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              style={{ marginTop: '2px', accentColor: '#10b981', width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', color: '#d1d5db', lineHeight: 1.6, fontFamily: "'Manrope', sans-serif" }}>
              J'ai lu et j'accepte la{' '}
              <a href="/politique-de-confidentialite" target="_blank" rel="noopener noreferrer" style={{ color: '#34d399', textDecoration: 'underline' }}>
                Politique de confidentialité
              </a>
            </span>
          </label>
        </div>

        <button
          onClick={handleAccept}
          disabled={!canSubmit || loading}
          style={{
            width: '100%',
            padding: '13px',
            fontSize: '15px',
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 700,
            color: '#fff',
            background: 'linear-gradient(135deg,#10b981,#34d399)',
            border: 'none',
            borderRadius: '12px',
            cursor: (!canSubmit || loading) ? 'not-allowed' : 'pointer',
            opacity: (!canSubmit || loading) ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {loading && (
            <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'vc-spin 0.7s linear infinite' }} />
          )}
          {loading ? 'Enregistrement…' : 'Continuer →'}
        </button>
      </div>
    </div>
  )
}
