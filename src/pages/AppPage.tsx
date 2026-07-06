import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SttForm from '../components/SttForm'
import Dictaphone from '../components/Dictaphone'
import TermsModal from '../components/TermsModal'
import { InstallPWAButton } from '../components/InstallPWA'
import { getTranscriptions, deleteTranscription, improveTranscription, exportTranscription, downloadBlob, pollTranscription } from '../api/transcriptions'
import { createPortalSession } from '../api/payments'
import { submitReview } from '../api/reviews'
import type { TranscriptionOut } from '../types/transcription'

export default function AppPage() {
  'use no memo'
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [toast, setToast] = useState<string | null>(
    (location.state as { toast?: string } | null)?.toast ?? null
  )
  const [history, setHistory] = useState<TranscriptionOut[]>([])
  const [improvingId, setImprovingId] = useState<string | null>(null)
  const [modeMap, setModeMap] = useState<Record<string, string>>({})
  const [errorMap, setErrorMap] = useState<Record<string, string>>({})
  const [downloadingFormat, setDownloadingFormat] = useState<Record<string, string>>({})
  const [termsAccepted, setTermsAccepted] = useState(
    user?.terms_accepted ?? true
  )
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewContent, setReviewContent] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewDone, setReviewDone] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const maxMinutes = user?.plan === 'pro' ? 180 : 15

  useEffect(() => {
    if (!toast) return
    window.history.replaceState({}, '')
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('payment') === 'success') {
      setToast('Bienvenue en Pro ! Votre abonnement est actif.')
      window.history.replaceState({}, '', '/app')
      refreshUser().catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!user) return
    const stopFns: Array<() => void> = []
    getTranscriptions()
      .then((items) => {
        setHistory(items)
        items
          .filter((t) => t.status === 'processing')
          .forEach((t) => {
            stopFns.push(
              pollTranscription(t.id, (updated) => {
                setHistory((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
              })
            )
          })
      })
      .catch(() => setHistory([]))
    return () => stopFns.forEach((stop) => stop())
  }, [user])

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  async function handleManageSubscription() {
    try {
      const url = await createPortalSession()
      window.open(url, '_blank')
    } catch {
      setToast('Erreur lors de la redirection vers le portail')
    }
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

  async function handleReviewSubmit() {
    if (reviewSubmitting || reviewContent.trim().length < 10) return
    setReviewSubmitting(true)
    setReviewError('')
    try {
      await submitReview(reviewContent.trim(), reviewRating)
      setReviewDone(true)
      setReviewContent('')
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Erreur lors de la soumission')
    } finally {
      setReviewSubmitting(false)
    }
  }

  async function handleDownload(id: string, format: 'docx' | 'pdf' | 'pptx', fileName: string) {
    setDownloadingFormat((prev) => ({ ...prev, [id]: format }))
    setErrorMap((prev) => ({ ...prev, [id]: '' }))
    try {
      const blob = await exportTranscription(id, format)
      downloadBlob(blob, `${fileName}.${format}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Erreur export ${format.toUpperCase()}`
      setErrorMap((prev) => ({ ...prev, [id]: msg }))
    } finally {
      setDownloadingFormat((prev) => ({ ...prev, [id]: '' }))
    }
  }

  return (
    <div style={{ background: '#030712', color: '#e5e7eb', fontFamily: "'Manrope', sans-serif", minHeight: '100vh' }}>
      {!termsAccepted && (
        <TermsModal onAccepted={() => setTermsAccepted(true)} />
      )}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '14px', color: '#fff', fontWeight: 500, margin: 0 }}>{user?.email}</p>
              <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>
                Plan {user?.plan}
                {user?.plan === 'free' && (
                  <button
                    onClick={() => navigate('/pricing')}
                    style={{ marginLeft: '8px', color: '#34d399', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: "'Manrope', sans-serif", fontSize: '12px', fontWeight: 600 }}
                  >→ Passer Pro</button>
                )}
              </p>
            </div>
            <InstallPWAButton />
            {user?.plan === 'pro' && (
              <button
                onClick={handleManageSubscription}
                style={{ fontSize: '14px', color: '#9ca3af', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontFamily: "'Manrope', sans-serif", fontWeight: 500 }}
              >
                Gérer l'abonnement
              </button>
            )}
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
          {user?.plan === 'pro' && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '20px', padding: '4px 12px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#34d399', letterSpacing: '0.04em' }}>Modèle fine-tuné actif</span>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '10px' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '20px', letterSpacing: '-0.02em', color: '#fff', margin: '0 0 4px' }}>
            Enregistrer une réunion
          </h2>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0, fontWeight: 500 }}>
            Capturez l'audio de Google Meet, Teams ou Zoom
          </p>
        </div>
        <div style={{ background: 'linear-gradient(180deg,#0b1020,#080b16)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
          <Dictaphone onTranscribed={(t) => setHistory((prev) => [t, ...prev])} maxMinutes={maxMinutes} />
        </div>

        <div style={{ marginTop: '40px', marginBottom: '10px' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '20px', letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>
            Importer un fichier audio
          </h2>
        </div>
        <div style={{ background: 'linear-gradient(180deg,#0b1020,#080b16)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
          <SttForm onTranscribed={(t) => setHistory((prev) => [t, ...prev])} />
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
                const isDownloading = !!downloadingFormat[t.id]

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

                    {t.status === 'processing' && (
                      <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
                        <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#34d399', borderRadius: '999px', display: 'inline-block', animation: 'vc-spin 0.7s linear infinite' }} />
                        Transcription en cours…
                      </p>
                    )}

                    {t.status === 'error' && (
                      <p style={{ fontSize: '14px', color: '#f87171', margin: 0, lineHeight: 1.6 }}>
                        Erreur lors de la transcription
                      </p>
                    )}

                    {t.status === 'done' && (
                      <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0, lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {t.text}
                      </p>
                    )}

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

                    {t.structured_content && (
                      <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '14px', marginTop: '10px' }}>
                        <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
                          Réunion structurée
                        </div>
                        <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '15px', color: '#d1fae5', margin: '0 0 8px' }}>
                          {t.structured_content.titre}
                        </h3>
                        <p style={{ fontSize: '14px', color: '#a7f3d0', margin: '0 0 10px', lineHeight: 1.6 }}>
                          {t.structured_content.introduction}
                        </p>
                        <ol style={{ margin: '0 0 10px', paddingLeft: '18px' }}>
                          {t.structured_content.points.map((point, i) => (
                            <li key={i} style={{ fontSize: '14px', color: '#d1fae5', lineHeight: 1.6, marginBottom: '4px' }}>
                              {point}
                            </li>
                          ))}
                        </ol>
                        <p style={{ fontSize: '14px', color: '#a7f3d0', margin: 0, lineHeight: 1.6 }}>
                          {t.structured_content.conclusion}
                        </p>
                      </div>
                    )}

                    {t.status === 'done' && (
                    <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
                      <select
                        value={selectedMode}
                        onChange={(e) => setModeMap((prev) => ({ ...prev, [t.id]: e.target.value }))}
                        style={{ background: '#0b1020', border: '1px solid rgba(255,255,255,0.12)', color: '#e5e7eb', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', fontFamily: "'Manrope', sans-serif", cursor: 'pointer' }}
                      >
                        <option value="correction">Correction</option>
                        <option value="reformulation">Reformulation</option>
                        <option value="résumé">Résumé</option>
                        {user?.plan === 'pro' ? <option value="structured_meeting">Réunion structurée</option> : null}
                      </select>
                      <button
                        onClick={() => handleImprove(t.id)}
                        disabled={isImproving}
                        style={{ background: 'linear-gradient(135deg,#10b981,#34d399)', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 16px', fontSize: '13px', fontFamily: "'Manrope', sans-serif", fontWeight: 600, cursor: isImproving ? 'not-allowed' : 'pointer', opacity: isImproving ? 0.5 : 1 }}
                      >
                        {isImproving ? 'En cours…' : 'Améliorer'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                      {user?.plan === 'pro' ? (
                        (['docx', 'pdf', 'pptx'] as const).map((format) => {
                          const needsStructured = format === 'pdf' || format === 'pptx'
                          const isDisabledFormat = needsStructured && !t.structured_content
                          const isFmtDownloading = downloadingFormat[t.id] === format
                          return (
                            <button
                              key={format}
                              onClick={() => handleDownload(t.id, format, t.file_name)}
                              disabled={isDisabledFormat || isDownloading}
                              title={isDisabledFormat ? "Générez d'abord la réunion structurée" : undefined}
                              style={{ fontSize: '12px', color: isDisabledFormat ? '#4b5563' : '#9ca3af', background: 'transparent', border: `1px solid ${isDisabledFormat ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.12)'}`, borderRadius: '8px', padding: '5px 12px', cursor: isDisabledFormat || isDownloading ? 'not-allowed' : 'pointer', fontFamily: "'Manrope', sans-serif", fontWeight: 500, opacity: isDisabledFormat ? 0.4 : 1 }}
                            >
                              {isFmtDownloading ? '…' : format.toUpperCase()}
                            </button>
                          )
                        })
                      ) : (
                        <button
                          onClick={() => handleDownload(t.id, 'docx', t.file_name)}
                          disabled={isDownloading}
                          style={{ fontSize: '12px', color: '#9ca3af', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '5px 12px', cursor: isDownloading ? 'not-allowed' : 'pointer', fontFamily: "'Manrope', sans-serif", fontWeight: 500, opacity: isDownloading ? 0.5 : 1 }}
                        >
                          {downloadingFormat[t.id] === 'docx' ? '…' : 'Télécharger DOCX'}
                        </button>
                      )}
                    </div>
                    </>
                    )}

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

        <div style={{ marginTop: '56px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#34d399', marginBottom: '10px' }}>Votre avis</div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '22px', letterSpacing: '-0.02em', color: '#fff', margin: '0 0 20px' }}>
            Laisser un avis
          </h2>
          {reviewDone ? (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '14px', padding: '20px 24px', color: '#34d399', fontWeight: 600, fontSize: '15px' }}>
              Merci pour votre avis ! Il est maintenant visible sur la page d'accueil.
            </div>
          ) : (
            <div style={{ background: 'linear-gradient(180deg,#0b1020,#080b16)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: star <= reviewRating ? '#fbbf24' : 'rgba(255,255,255,0.15)', padding: '0 2px', lineHeight: 1 }}
                  >★</button>
                ))}
                <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500, marginLeft: '6px' }}>{reviewRating}/5</span>
              </div>
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="Décrivez votre expérience avec voclaire… (10 à 500 caractères)"
                maxLength={500}
                rows={4}
                style={{ width: '100%', background: '#05070f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#e5e7eb', fontFamily: "'Manrope', sans-serif", fontSize: '14px', lineHeight: 1.6, padding: '12px 14px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>{reviewContent.length}/500</span>
                <button
                  onClick={handleReviewSubmit}
                  disabled={reviewSubmitting || reviewContent.trim().length < 10}
                  style={{ background: reviewContent.trim().length < 10 ? 'rgba(16,185,129,0.4)' : '#10b981', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 22px', fontSize: '14px', fontFamily: "'Manrope', sans-serif", fontWeight: 700, cursor: reviewContent.trim().length < 10 || reviewSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {reviewSubmitting ? 'Envoi…' : "Publier l'avis"}
                </button>
              </div>
              {reviewError && (
                <p style={{ fontSize: '13px', color: '#f87171', margin: '8px 0 0' }}>{reviewError}</p>
              )}
            </div>
          )}
        </div>
      </main>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px', marginTop: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '4px 12px', fontSize: '12px', color: '#6b7280' }}>
          <Link to="/contact" style={{ color: '#6b7280', textDecoration: 'none' }}>Nous contacter</Link>
          <span>·</span>
          <Link to="/mentions-legales" style={{ color: '#6b7280', textDecoration: 'none' }}>Mentions légales</Link>
          <span>·</span>
          <Link to="/politique-de-confidentialite" style={{ color: '#6b7280', textDecoration: 'none' }}>Politique de confidentialité</Link>
          <span>·</span>
          <Link to="/cgu" style={{ color: '#6b7280', textDecoration: 'none' }}>CGU</Link>
          <span>·</span>
          <Link to="/cgv" style={{ color: '#6b7280', textDecoration: 'none' }}>CGV</Link>
        </div>
      </footer>
    </div>
  )
}
