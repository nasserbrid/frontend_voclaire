import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import { createCheckout } from '../api/payments'

const FEATURES_FREE = [
  '4h de fichiers audio / mois (2h max par fichier)',
  '4h de réunions / mois (2h max par réunion)',
  'Identification automatique des interlocuteurs (qui a dit quoi)',
  'Amélioration du texte par IA : 10 fois par mois (correction, reformulation, résumé)',
  'Export WORD',
  'Données traitées et stockées en France',
]

const FEATURES_PRO = [
  'Transcription illimitée',
  'LLM illimité (correction, reformulation, résumé)',
  'Modèle IA calibré pour le français',
  'Export DOCX / PDF / PPTX structurés',
  'Résiliation en 1 clic',
]

const FAQ_ITEMS = [
  { q: 'Où sont stockées mes données ?', a: "Vos fichiers audio et transcriptions sont hébergés sur des serveurs en France car rien n'est transmis à des services étrangers." },
  { q: 'Comment fonctionne l\'enregistrement de réunion ?', a: "Depuis votre navigateur, cliquez sur Démarrer l'enregistrement pendant une réunion Teams, Zoom ou Google Meet. Voclaire capture l'audio de tous les participants et génère la transcription automatiquement. L'offre Free permet d'enregistrer jusqu'à 2h par réunion, dans la limite de 4h par mois au total. L'offre Pro est illimitée." },
  { q: "Comment fonctionne la transcription d'un fichier audio ?", a: "Déposez directement un fichier audio depuis votre PC ou smartphone (MP3, MP4, M4A, WAV et autres formats courants). Voclaire transcrit le contenu et identifie automatiquement les différents interlocuteurs. L'offre Free accepte les fichiers jusqu'à 2h chacun, dans la limite de 4h par mois au total. L'offre Pro est illimitée." },
  { q: "Comment fonctionne l'identification des interlocuteurs ?", a: "Voclaire détecte automatiquement les changements de locuteur et attribue chaque prise de parole à un interlocuteur distinct. Cette fonctionnalité est incluse dans les deux offres." },
  { q: 'Quelle est la limite gratuite ?', a: "Avec l'offre Free, vous disposez de deux quotas séparés chaque mois : 4h pour vos fichiers audio et 4h pour vos enregistrements de réunion. Chaque fichier ou réunion peut durer jusqu'à 2h. Concrètement : par exemple 2 fichiers de 2h et 2 réunions de 2h, gratuitement, chaque mois. Avec l'offre Pro, tout est illimité : ni plafond par fichier/réunion, ni volume mensuel." },
  { q: 'Puis-je transcrire une réunion de 2h ?', a: "Oui, avec l'offre Free vous disposez de 4h par mois pour vos réunions et 4h par mois pour vos fichiers audio, chaque réunion ou fichier pouvant durer jusqu'à 2h. Au-delà de 4h cumulées dans le mois, il faut passer à l'offre Pro, qui n'a aucune limite de durée." },
]

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="8" fill="rgba(16,185,129,0.15)" />
      <path d="M4.5 8l2.5 2.5 4.5-5" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleUpgrade() {
    setLoading(true)
    setError(null)
    try {
      const url = await createCheckout(billingPeriod)
      window.open(url, '_blank')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const monthlyPrice = '9,99 €'
  const annualMonthlyPrice = '7,99 €'
  const annualYearlyPrice = '95,88 €/an'

  return (
    <div style={{ background: '#030712', color: '#e5e7eb', fontFamily: "'Manrope', sans-serif", minHeight: '100vh' }}>
      <Helmet>
        <title>Tarifs Voclaire - Gratuit & Pro | Transcription audio IA</title>
        <meta name="description" content="Découvrez les tarifs de Voclaire. Plan Free gratuit (4h/mois par catégorie) ou Pro à 9,99 €/mois pour la transcription illimitée, l'export PDF/PPTX et le modèle IA calibré pour le français." />
      </Helmet>
      <header style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/voclaire-logo-icon-wave.png" alt="voclaire" style={{ height: '30px', width: 'auto' }} />
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '19px', letterSpacing: '-0.02em', color: '#fff' }}>voclaire</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{ fontSize: '14px', color: '#9ca3af', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontFamily: "'Manrope', sans-serif", fontWeight: 500 }}
        >
          ← Retour
        </button>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#34d399', marginBottom: '12px' }}>Tarifs</div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '38px', letterSpacing: '-0.02em', color: '#fff', margin: '0 0 16px' }}>
            Simple et transparent
          </h1>
          <p style={{ fontSize: '17px', color: '#9ca3af', margin: 0 }}>
            Commencez gratuitement, passez Pro quand vous êtes prêt.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Card Free */}
          <div style={{ flex: '1 1 340px', maxWidth: '420px', background: 'linear-gradient(180deg,#0b1020,#080b16)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', display: 'flex', flexDirection: 'column' }}>
            <div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '28px', color: '#fff', margin: '0 0 8px' }}>Free</h2>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '28px' }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '34px', color: '#fff' }}>0 €</span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>/mois</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {FEATURES_FREE.map((feat) => (
                  <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckIcon />
                    <span style={{ fontSize: '14px', color: '#d1d5db' }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => navigate('/register')}
              style={{ marginTop: 'auto', width: '100%', padding: '13px', fontSize: '15px', fontFamily: "'Manrope', sans-serif", fontWeight: 600, color: '#9ca3af', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', cursor: 'pointer' }}
            >
              Commencer gratuitement
            </button>
          </div>

          {/* Card Pro */}
          <div style={{ flex: '1 1 340px', maxWidth: '420px', background: 'linear-gradient(180deg,#0b1020,#080b16)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '32px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: 700, color: '#34d399', letterSpacing: '0.04em' }}>
              Populaire
            </div>

            <div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '28px', color: '#fff', margin: '0 0 8px' }}>Pro</h2>

              {/* Toggle mensuel/annuel */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  style={{ padding: '6px 14px', fontSize: '13px', fontFamily: "'Manrope', sans-serif", fontWeight: 600, borderRadius: '8px', cursor: 'pointer', border: billingPeriod === 'monthly' ? 'none' : '1px solid rgba(255,255,255,0.15)', background: billingPeriod === 'monthly' ? '#10b981' : 'transparent', color: billingPeriod === 'monthly' ? '#fff' : '#9ca3af' }}
                >
                  Mensuel
                </button>
                <button
                  onClick={() => setBillingPeriod('annual')}
                  style={{ padding: '6px 14px', fontSize: '13px', fontFamily: "'Manrope', sans-serif", fontWeight: 600, borderRadius: '8px', cursor: 'pointer', border: billingPeriod === 'annual' ? 'none' : '1px solid rgba(255,255,255,0.15)', background: billingPeriod === 'annual' ? '#10b981' : 'transparent', color: billingPeriod === 'annual' ? '#fff' : '#9ca3af' }}
                >
                  Annuel
                </button>
                {billingPeriod === 'annual' && (
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#34d399' }}>-20%</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '34px', color: '#fff' }}>
                  {billingPeriod === 'monthly' ? monthlyPrice : annualMonthlyPrice}
                </span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>/mois</span>
              </div>
              {billingPeriod === 'annual' && (
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 24px' }}>{annualYearlyPrice}</p>
              )}
              {billingPeriod === 'monthly' && <div style={{ height: '28px' }} />}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {FEATURES_PRO.map((feat) => (
                  <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckIcon />
                    <span style={{ fontSize: '14px', color: '#d1d5db' }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
              {user?.plan === 'pro' ? (
                <div style={{ width: '100%', padding: '13px', fontSize: '15px', fontFamily: "'Manrope', sans-serif", fontWeight: 600, color: '#34d399', textAlign: 'center' }}>
                  Plan actif ✓
                </div>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  style={{ width: '100%', padding: '13px', fontSize: '15px', fontFamily: "'Manrope', sans-serif", fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#10b981,#34d399)', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Redirection…' : 'Passer Pro'}
                </button>
              )}
              {error && (
                <p style={{ fontSize: '13px', color: '#f87171', margin: '10px 0 0', textAlign: 'center' }}>
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <section style={{ maxWidth: '760px', margin: '80px auto 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '30px', letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>Questions fréquentes</h2>
          </div>
          <dl>
            {FAQ_ITEMS.map((item, i) => (
              <div key={item.q} style={{ padding: '22px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
                <dt style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{item.q}</dt>
                <dd style={{ fontSize: '15px', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </div>
  )
}
