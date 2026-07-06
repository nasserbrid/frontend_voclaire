import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { transcribeAudio } from '../api/stt'
import { getDictaphoneUnsupportedReason } from '../utils/mediaSupport'
import ReviewsSection from './ReviewsSection'

const faqItems = [
  { q: 'Voclaire est-il gratuit ?', a: "Plan Free permanent : 60 min/mois, pas de CB. Plan Pro 9,99 €/mois (7,99 €/mois annuel)." },
  { q: 'Comment transcrire une réunion Google Meet, Teams ou Zoom ?', a: 'Section "Enregistrer une réunion" dans l\'app, sélectionner l\'onglet, cliquer Transcrire.' },
  { q: 'Quels formats audio sont supportés ?', a: 'MP3, WAV, M4A, OGG, FLAC. Max 30 min (Free) ou 3h (Pro).' },
  { q: 'Quelle est la précision de la transcription ?', a: 'Whisper large-v3-turbo. Plan Pro = modèle fine-tuné français.' },
  { q: 'Peut-on exporter en Word, PDF ou PowerPoint ?', a: 'DOCX brut (Free). DOCX + PDF + PPTX structurés (Pro).' },
  { q: 'Voclaire respecte-t-il le RGPD ?', a: 'Oui, données sécurisées, suppression possible à tout moment, éditeur France.' },
]

const DEMO_MAX_MINUTES = 10

const steps = [
  { num: '01', title: 'Enregistrez ou déposez', body: 'Enregistrez une réunion directement depuis Google Meet, Teams ou Zoom, ou déposez un fichier MP3, WAV, M4A.' },
  { num: '02', title: "L'IA transcrit", body: 'Le modèle Whisper convertit la parole en texte avec une grande précision, en français.' },
  { num: '03', title: 'Récupérez le texte', body: "Copiez, exportez en DOCX/PDF/PPTX, ou affinez avec la correction et la reformulation IA." },
]

const freeFeatures = [
  '60 min de transcription / mois',
  'Fichier audio max 30 min',
  'Enregistrement réunion max 10 min',
  'Modèle Whisper haute précision',
  '10 améliorations LLM / mois',
  'Export DOCX (texte brut)',
]

const proFeatures = [
  "Transcription illimitée (fichiers jusqu'à 3h)",
  "Enregistrement réunion jusqu'à 30 min",
  'LLM illimité (correction, reformulation, résumé)',
  'Modèle Whisper fine-tuné français',
  'Export Word, PDF et PowerPoint structurés',
  'Transcription de réunion structurée',
  'Historique et sauvegarde illimités',
]

const freePlan = [
  '60 min de transcription / mois',
  'Fichier audio max 30 min',
  'Enregistrement réunion max 10 min',
  '10 améliorations LLM / mois',
  'Export DOCX (texte brut)',
]
const proPlan = [
  "Transcription illimitée (fichiers jusqu'à 3h)",
  "Enregistrement réunion jusqu'à 30 min",
  'LLM illimité (correction, reformulation, résumé)',
  'Modèle Whisper fine-tuné français',
  'Export Word, PDF et PowerPoint structurés',
  'Transcription de réunion structurée',
  'Résiliation en 1 clic',
]

export default function LandingPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [copied, setCopied] = useState(false)
  const [meta, setMeta] = useState('')

  const [demoRecording, setDemoRecording] = useState(false)
  const [demoElapsed, setDemoElapsed] = useState(0)
  const [demoAudioFile, setDemoAudioFile] = useState<File | null>(null)
  const [demoTranscript, setDemoTranscript] = useState<string | null>(null)
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoError, setDemoError] = useState<string | null>(null)
  const [demoMicWarning, setDemoMicWarning] = useState<string | null>(null)
  const [demoUnsupportedReason] = useState(getDictaphoneUnsupportedReason)

  const demoMediaRecorderRef = useRef<MediaRecorder | null>(null)
  const demoChunksRef = useRef<Blob[]>([])
  const demoTimerRef = useRef<number | null>(null)
  const demoDisplayStreamRef = useRef<MediaStream | null>(null)
  const demoMicStreamRef = useRef<MediaStream | null>(null)
  const demoAudioContextRef = useRef<AudioContext | null>(null)

  function cleanupDemoStreams() {
    demoDisplayStreamRef.current?.getTracks().forEach((t) => t.stop())
    demoMicStreamRef.current?.getTracks().forEach((t) => t.stop())
    demoAudioContextRef.current?.close()
    demoDisplayStreamRef.current = null
    demoMicStreamRef.current = null
    demoAudioContextRef.current = null
  }

  useEffect(() => {
    return () => {
      if (demoTimerRef.current !== null) clearInterval(demoTimerRef.current)
      cleanupDemoStreams()
    }
  }, [])

  function stopDemoRecording() {
    if (demoMediaRecorderRef.current && demoMediaRecorderRef.current.state !== 'inactive') {
      demoMediaRecorderRef.current.stop()
    }
    if (demoTimerRef.current !== null) {
      clearInterval(demoTimerRef.current)
      demoTimerRef.current = null
    }
    setDemoRecording(false)
  }

  async function startDemoRecording() {
    setDemoError(null)
    setDemoMicWarning(null)
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true })
      displayStream.getVideoTracks().forEach((track) => {
        track.stop()
        displayStream.removeTrack(track)
      })

      if (displayStream.getAudioTracks().length === 0) {
        displayStream.getTracks().forEach((t) => t.stop())
        setDemoError("Aucun audio détecté. Repartagez en sélectionnant un onglet et en cochant « Partager l'audio de l'onglet ».")
        return
      }

      let micStream: MediaStream | null = null
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch {
        setDemoMicWarning("Micro non autorisé — seule la voix des autres participants sera enregistrée.")
      }

      const audioContext = new AudioContext()
      const destination = audioContext.createMediaStreamDestination()
      audioContext.createMediaStreamSource(displayStream).connect(destination)
      if (micStream) audioContext.createMediaStreamSource(micStream).connect(destination)

      demoDisplayStreamRef.current = displayStream
      demoMicStreamRef.current = micStream
      demoAudioContextRef.current = audioContext

      demoChunksRef.current = []
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg'
      const mediaRecorder = new MediaRecorder(destination.stream, { mimeType })
      demoMediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) demoChunksRef.current.push(e.data)
      }
      mediaRecorder.onstop = () => {
        const blob = new Blob(demoChunksRef.current, { type: mimeType })
        setDemoAudioFile(new File([blob], 'reunion.webm', { type: mimeType }))
        cleanupDemoStreams()
      }
      displayStream.getAudioTracks()[0].onended = () => stopDemoRecording()

      mediaRecorder.start(1000)
      setDemoAudioFile(null)
      setDemoTranscript(null)
      setDemoElapsed(0)
      setDemoRecording(true)

      let localElapsed = 0
      demoTimerRef.current = window.setInterval(() => {
        localElapsed += 1
        setDemoElapsed(localElapsed)
        if (localElapsed >= DEMO_MAX_MINUTES * 60) stopDemoRecording()
      }, 1000)
    } catch (err) {
      setDemoError(err instanceof Error ? err.message : "Impossible de démarrer l'enregistrement")
    }
  }

  async function handleDemoTranscribe() {
    if (!demoAudioFile || demoLoading) return
    setDemoLoading(true)
    setDemoError(null)
    try {
      const text = await transcribeAudio(demoAudioFile)
      setDemoTranscript(text)
    } catch (err) {
      setDemoError(err instanceof Error ? err.message : 'Erreur lors de la transcription')
    } finally {
      setDemoLoading(false)
    }
  }

  function handleDemoDownload() {
    if (!demoAudioFile) return
    const url = URL.createObjectURL(demoAudioFile)
    const a = document.createElement('a')
    a.href = url
    a.download = `reunion-${new Date().toISOString().slice(0, 10)}.webm`
    a.click()
    URL.revokeObjectURL(url)
  }

  function formatDemoTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  function scrollToDemo(e: React.MouseEvent) {
    e.preventDefault()
    const el = document.getElementById('demo')
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 20, behavior: 'smooth' })
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) { setFile(f); setError(''); setResult('') }
  }

  function onDragOver(e: React.DragEvent) { e.preventDefault(); setDragging(true) }
  function onDragLeave(e: React.DragEvent) { e.preventDefault(); setDragging(false) }
  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f && f.type.startsWith('audio')) { setFile(f); setError(''); setResult('') }
    else setError('Merci de déposer un fichier audio.')
  }

  async function onTranscribe() {
    if (!file || loading) return
    setLoading(true); setError(''); setResult('')
    const t0 = Date.now()
    try {
      const text = await transcribeAudio(file)
      setResult(text)
      setMeta(((Date.now() - t0) / 1000).toFixed(1) + 's')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la transcription')
    } finally {
      setLoading(false)
    }
  }

  function onCopy() {
    if (result && navigator.clipboard) navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div style={{ background: '#030712', color: '#e5e7eb', fontFamily: "'Manrope', sans-serif", minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>
      <Helmet>
        <title>Voclaire - Transcription audio par IA</title>
        <meta name="description" content="Transcrivez vos réunions, enregistrements et fichiers audio en texte avec Voclaire. Propulsé par Whisper. Gratuit jusqu'à 60 min/mois. Export DOCX, PDF, PowerPoint." />
      </Helmet>

      {/* ambient glow */}
      <div style={{ position: 'absolute', top: '-220px', left: '50%', transform: 'translateX(-50%)', width: '900px', height: '600px', background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.22), transparent 60%)', pointerEvents: 'none', filter: 'blur(20px)', zIndex: 0 }} />

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)', background: 'rgba(3,7,18,0.72)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: 'linear-gradient(140deg,#10b981,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}>
              <div style={{ width: '8px', height: '14px', background: '#fff', borderRadius: '4px' }} />
            </div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '19px', letterSpacing: '-0.02em', color: '#fff' }}>voclaire</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a href="#pricing" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14.5px', fontWeight: 500 }}>Tarifs</a>
            <Link to="/login" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14.5px', fontWeight: 500 }}>Se connecter</Link>
            <Link to="/register" style={{ background: '#10b981', color: '#fff', textDecoration: 'none', padding: '9px 18px', borderRadius: '10px', fontSize: '14.5px', fontWeight: 600, boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}>S'inscrire</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: '880px', margin: '0 auto', padding: '96px 24px 60px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '60px', lineHeight: 1.04, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 22px' }}>
          Votre audio en texte,<br />
          <span style={{ background: 'linear-gradient(120deg,#34d399,#10b981)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>en quelques secondes.</span>
        </h1>
        <p style={{ fontSize: '19px', lineHeight: 1.6, color: '#9ca3af', maxWidth: '560px', margin: '0 auto 38px', fontWeight: 500 }}>
          Déposez un fichier audio, obtenez une transcription précise instantanément. Sans compte, sans installation. Corrigez et reformulez ensuite avec l'IA.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="#demo" onClick={scrollToDemo} style={{ background: '#10b981', color: '#fff', textDecoration: 'none', padding: '15px 30px', borderRadius: '12px', fontSize: '16px', fontWeight: 700, boxShadow: '0 8px 28px rgba(16,185,129,0.45)', display: 'inline-flex', alignItems: 'center', gap: '9px' }}>
            Essayer maintenant <span style={{ fontSize: '18px', lineHeight: 1 }}>↓</span>
          </a>
          <a href="#pricing" style={{ color: '#e5e7eb', textDecoration: 'none', padding: '15px 24px', borderRadius: '12px', fontSize: '16px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.12)' }}>Voir les tarifs</a>
        </div>
        <p style={{ fontSize: '13.5px', color: '#6b7280', marginTop: '22px', fontWeight: 500 }}>Aucune carte bancaire requise · Premier essai gratuit en bas de page</p>
      </section>

      {/* DEMO DICTAPHONE */}
      <section id="demo" style={{ position: 'relative', zIndex: 1, maxWidth: '760px', margin: '0 auto', padding: '40px 24px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#34d399', marginBottom: '12px' }}>Démo en direct</div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '34px', letterSpacing: '-0.02em', color: '#fff', margin: '0 0 10px' }}>Enregistrez votre réunion</h2>
          <p style={{ color: '#9ca3af', fontSize: '16px', margin: 0, fontWeight: 500 }}>Capturez l'audio de Google Meet, Teams ou Zoom directement depuis le navigateur.</p>
        </div>

        <div style={{ background: 'linear-gradient(180deg,#0b1020,#080b16)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
          {demoUnsupportedReason ? (
            <div style={{ textAlign: 'center', padding: '34px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '14px', color: '#9ca3af', fontWeight: 500 }}>{demoUnsupportedReason}</div>
            </div>
          ) : (
          <>
          {!demoRecording && !demoAudioFile && (
            <div style={{ textAlign: 'center', padding: '34px 24px', borderRadius: '16px', border: '1.5px dashed rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.04)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16,185,129,0.16)', border: '1px solid rgba(16,185,129,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <span style={{ width: '18px', height: '18px', borderRadius: '999px', background: '#ef4444', display: 'block' }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>
                Démarrer l'enregistrement
              </div>
              <div style={{ fontSize: '14px', color: '#9ca3af', fontWeight: 500, marginBottom: '18px' }}>
                Partagez l'onglet de votre réunion en cochant « Partager l'audio de l'onglet »
              </div>
              <button
                onClick={startDemoRecording}
                style={{ padding: '13px 26px', borderRadius: '12px', border: 'none', fontFamily: "'Manrope', sans-serif", fontSize: '15px', fontWeight: 700, cursor: 'pointer', background: '#10b981', color: '#fff', boxShadow: '0 8px 24px rgba(16,185,129,0.4)' }}
              >
                Démarrer l'enregistrement
              </button>
            </div>
          )}

          {demoRecording && (
            <div style={{ textAlign: 'center', padding: '34px 24px', borderRadius: '16px', border: '1.5px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '999px', background: '#ef4444', display: 'inline-block', animation: 'vc-pulse 1.2s ease-in-out infinite' }} />
                <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '26px', color: '#fff', letterSpacing: '0.02em' }}>{formatDemoTime(demoElapsed)}</span>
              </div>
              {DEMO_MAX_MINUTES * 60 - demoElapsed <= 120 && DEMO_MAX_MINUTES * 60 - demoElapsed > 0 && (
                <div style={{ fontSize: '13px', color: '#fca5a5', fontWeight: 600, marginBottom: '14px' }}>
                  Limite atteinte dans {Math.ceil((DEMO_MAX_MINUTES * 60 - demoElapsed) / 60)} min
                </div>
              )}
              <button
                onClick={stopDemoRecording}
                style={{ padding: '13px 26px', borderRadius: '12px', border: 'none', fontFamily: "'Manrope', sans-serif", fontSize: '15px', fontWeight: 700, cursor: 'pointer', background: '#ef4444', color: '#fff', boxShadow: '0 8px 24px rgba(239,68,68,0.35)' }}
              >
                Arrêter
              </button>
            </div>
          )}

          {!demoRecording && demoAudioFile && (
            <div style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.04)' }}>
              <div style={{ fontSize: '14px', color: '#e5e7eb', fontWeight: 600, marginBottom: '4px' }}>
                Enregistrement prêt · {formatDemoTime(demoElapsed)}
              </div>
              <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500, marginBottom: '18px' }}>
                {Math.round(demoAudioFile.size / 1024)} Ko
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleDemoTranscribe}
                  disabled={demoLoading}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '13px', borderRadius: '12px', border: 'none', fontFamily: "'Manrope', sans-serif", fontSize: '15px', fontWeight: 700, cursor: demoLoading ? 'not-allowed' : 'pointer', background: demoLoading ? 'rgba(16,185,129,0.4)' : '#10b981', color: '#fff', boxShadow: demoLoading ? 'none' : '0 8px 24px rgba(16,185,129,0.4)' }}
                >
                  {demoLoading && (
                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '999px', display: 'inline-block', animation: 'vc-spin 0.7s linear infinite' }} />
                  )}
                  {demoLoading ? 'Transcription en cours…' : 'Transcrire maintenant'}
                </button>
                <button
                  onClick={handleDemoDownload}
                  style={{ padding: '13px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', fontFamily: "'Manrope', sans-serif", fontSize: '15px', fontWeight: 600, cursor: 'pointer', background: 'transparent', color: '#e5e7eb' }}
                >
                  Télécharger l'audio
                </button>
              </div>
            </div>
          )}

          {demoMicWarning && (
            <div style={{ marginTop: '14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500 }}>
              {demoMicWarning}
            </div>
          )}

          {demoError && (
            <div style={{ marginTop: '14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500 }}>
              {demoError}
            </div>
          )}

          {demoTranscript && (
            <div style={{ marginTop: '22px', animation: 'vc-fadeup 0.4s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '999px', background: '#22c55e', display: 'inline-block' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#e5e7eb', letterSpacing: '0.02em' }}>Transcription</span>
                </div>
              </div>
              <div style={{ background: '#05070f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px 20px', fontSize: '15.5px', lineHeight: 1.7, color: '#d1d5db', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{demoTranscript}</div>
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.22)', borderRadius: '14px', padding: '14px 18px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#fff', marginBottom: '2px' }}>
                    Affiner avec l'IA{' '}
                    <span style={{ fontSize: '11px', background: '#10b981', color: '#fff', padding: '2px 7px', borderRadius: '6px', verticalAlign: 'middle', marginLeft: '4px' }}>Pro</span>
                  </div>
                  <div style={{ fontSize: '13.5px', color: '#9ca3af', fontWeight: 500 }}>Corrigez la ponctuation, reformulez, structurez automatiquement.</div>
                </div>
                <a href="#cta" style={{ background: '#10b981', color: '#fff', textDecoration: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 700, whiteSpace: 'nowrap' }}>Débloquer</a>
              </div>
            </div>
          )}
          </>
          )}
        </div>
      </section>

      {/* DEMO FICHIER */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: '760px', margin: '0 auto', padding: '0 24px 90px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#34d399', marginBottom: '12px' }}>Déjà un enregistrement ?</div>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '34px', letterSpacing: '-0.02em', color: '#fff', margin: '0 0 10px' }}>Ou déposez un fichier audio</h2>
          <p style={{ color: '#9ca3af', fontSize: '16px', margin: 0, fontWeight: 500 }}>Déposez un fichier audio. La transcription s'affiche ici même.</p>
        </div>

        <div style={{ background: 'linear-gradient(180deg,#0b1020,#080b16)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>

          {/* dropzone */}
          <label htmlFor="vc-file" onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            style={{ display: 'block', textAlign: 'center', padding: '34px 24px', borderRadius: '16px', border: `1.5px dashed ${dragging ? '#34d399' : 'rgba(16,185,129,0.4)'}`, background: dragging ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.04)', cursor: 'pointer', transition: 'all 0.2s' }}>
            <input id="vc-file" type="file" accept="audio/*" onChange={onFileChange} style={{ display: 'none' }} />
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16,185,129,0.16)', border: '1px solid rgba(16,185,129,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '20px' }}>
                {[8, 16, 11, 18, 7].map((h, i) => (
                  <span key={i} style={{ width: '3px', height: `${h}px`, background: '#34d399', borderRadius: '2px', display: 'block' }} />
                ))}
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '5px' }}>
              {file ? file.name : (dragging ? 'Déposez le fichier ici' : 'Déposez un fichier audio')}
            </div>
            <div style={{ fontSize: '14px', color: '#9ca3af', fontWeight: 500 }}>
              {file ? `${Math.round(file.size / 1024)} Ko · prêt à transcrire` : 'ou cliquez pour parcourir · MP3, WAV, M4A…'}
            </div>
          </label>

          <button onClick={onTranscribe} disabled={!file || loading}
            style={{ marginTop: '18px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '15px', borderRadius: '13px', border: 'none', fontFamily: "'Manrope', sans-serif", fontSize: '16px', fontWeight: 700, cursor: (!file || loading) ? 'not-allowed' : 'pointer', background: (!file || loading) ? 'rgba(16,185,129,0.4)' : '#10b981', color: '#fff', transition: 'background 0.2s', boxShadow: (!file || loading) ? 'none' : '0 8px 24px rgba(16,185,129,0.4)' }}>
            {loading && (
              <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '999px', display: 'inline-block', animation: 'vc-spin 0.7s linear infinite' }} />
            )}
            {loading ? 'Transcription en cours…' : 'Transcrire'}
          </button>

          {error && (
            <div style={{ marginTop: '14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500 }}>{error}</div>
          )}

          {result && (
            <div style={{ marginTop: '22px', animation: 'vc-fadeup 0.4s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '999px', background: '#22c55e', display: 'inline-block' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#e5e7eb', letterSpacing: '0.02em' }}>Transcription</span>
                  {meta && <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>· {meta}</span>}
                </div>
                <button onClick={onCopy} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#6ee7b7', padding: '6px 12px', borderRadius: '9px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
                  {copied ? 'Copié ✓' : 'Copier'}
                </button>
              </div>
              <div style={{ background: '#05070f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px 20px', fontSize: '15.5px', lineHeight: 1.7, color: '#d1d5db', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{result}</div>
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.22)', borderRadius: '14px', padding: '14px 18px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#fff', marginBottom: '2px' }}>
                    Affiner avec l'IA{' '}
                    <span style={{ fontSize: '11px', background: '#10b981', color: '#fff', padding: '2px 7px', borderRadius: '6px', verticalAlign: 'middle', marginLeft: '4px' }}>Pro</span>
                  </div>
                  <div style={{ fontSize: '13.5px', color: '#9ca3af', fontWeight: 500 }}>Corrigez la ponctuation, reformulez, structurez automatiquement.</div>
                </div>
                <a href="#cta" style={{ background: '#10b981', color: '#fff', textDecoration: 'none', padding: '9px 16px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 700, whiteSpace: 'nowrap' }}>Débloquer</a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: '1040px', margin: '0 auto', padding: '50px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '46px' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '34px', letterSpacing: '-0.02em', color: '#fff', margin: '0 0 10px' }}>Comment ça marche</h2>
          <p style={{ color: '#9ca3af', fontSize: '16px', margin: 0, fontWeight: 500 }}>Trois étapes, zéro friction.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
          {steps.map(step => (
            <div key={step.num} style={{ background: 'linear-gradient(180deg,rgba(255,255,255,0.03),transparent)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '28px 24px' }}>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '14px', fontWeight: 700, color: '#10b981', marginBottom: '18px' }}>{step.num}</div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: '19px', color: '#fff', marginBottom: '8px' }}>{step.title}</div>
              <div style={{ fontSize: '14.5px', lineHeight: 1.6, color: '#9ca3af', fontWeight: 500 }}>{step.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ position: 'relative', zIndex: 1, maxWidth: '1040px', margin: '0 auto', padding: '50px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '46px' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '34px', letterSpacing: '-0.02em', color: '#fff', margin: '0 0 10px' }}>Gratuit vs Pro</h2>
          <p style={{ color: '#9ca3af', fontSize: '16px', margin: 0, fontWeight: 500 }}>Commencez gratuitement. Passez au niveau supérieur quand vous en avez besoin.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '30px' }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '20px', color: '#fff', marginBottom: '6px' }}>Free</div>
            <div style={{ fontSize: '13.5px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '22px' }}>Gratuit</div>
            {freeFeatures.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '11px', padding: '9px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#22c55e', fontSize: '15px', marginTop: '1px' }}>✓</span>
                <span style={{ fontSize: '15px', color: '#d1d5db', fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'linear-gradient(180deg,rgba(16,185,129,0.14),rgba(16,185,129,0.04))', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '20px', padding: '30px' }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '20px', color: '#fff', marginBottom: '6px' }}>Pro</div>
            <div style={{ fontSize: '13.5px', color: '#6ee7b7', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '22px' }}>9,99 € / mois</div>
            {proFeatures.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '11px', padding: '9px 0', borderTop: '1px solid rgba(16,185,129,0.18)' }}>
                <span style={{ color: '#34d399', fontSize: '15px', marginTop: '1px' }}>✦</span>
                <span style={{ fontSize: '15px', color: '#d1fae5', fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ position: 'relative', zIndex: 1, maxWidth: '920px', margin: '0 auto', padding: '50px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '46px' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '34px', letterSpacing: '-0.02em', color: '#fff', margin: '0 0 10px' }}>Tarifs simples</h2>
          <p style={{ color: '#9ca3af', fontSize: '16px', margin: 0, fontWeight: 500 }}>Sans engagement. Annulez à tout moment.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'stretch' }}>
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '22px', padding: '34px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '21px', color: '#fff' }}>Free</div>
            <div style={{ margin: '18px 0 6px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '46px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>0€</span>
              <span style={{ color: '#9ca3af', fontSize: '15px', fontWeight: 600 }}>/ pour toujours</span>
            </div>
            <div style={{ fontSize: '14.5px', color: '#9ca3af', marginBottom: '24px', fontWeight: 500 }}>Pour transcrire ponctuellement.</div>
            <div style={{ flex: 1 }}>
              {freePlan.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '7px 0' }}>
                  <span style={{ color: '#22c55e' }}>✓</span>
                  <span style={{ fontSize: '14.5px', color: '#d1d5db', fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>
            <Link
              to="/register"
              style={{ marginTop: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', textDecoration: 'none', padding: '13px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', display: 'block' }}
            >
              Commencer gratuitement
            </Link>
          </div>
          <div style={{ background: 'linear-gradient(180deg,rgba(16,185,129,0.16),rgba(16,185,129,0.04))', border: '1px solid rgba(16,185,129,0.45)', borderRadius: '22px', padding: '34px', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 20px 50px rgba(16,185,129,0.18)' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '34px', background: '#10b981', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '999px', letterSpacing: '0.03em' }}>Populaire</div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '21px', color: '#fff' }}>Pro</div>
            <div style={{ margin: '18px 0 4px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '46px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>9,99€</span>
              <span style={{ color: '#6ee7b7', fontSize: '15px', fontWeight: 600 }}>/ mois</span>
            </div>
            <div style={{ fontSize: '13px', color: '#34d399', fontWeight: 600, marginBottom: '6px' }}>ou 7,99 € / mois en annuel <span style={{ background: 'rgba(16,185,129,0.2)', padding: '2px 7px', borderRadius: '6px' }}>-20%</span></div>
            <div style={{ fontSize: '14.5px', color: '#6ee7b7', marginBottom: '24px', fontWeight: 500 }}>Pour transcrire et affiner au quotidien.</div>
            <div style={{ flex: 1 }}>
              {proPlan.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '7px 0' }}>
                  <span style={{ color: '#34d399' }}>✦</span>
                  <span style={{ fontSize: '14.5px', color: '#d1fae5', fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>
            <Link
              to="/pricing"
              style={{ marginTop: '24px', textAlign: 'center', background: '#10b981', color: '#fff', textDecoration: 'none', padding: '13px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', boxShadow: '0 8px 24px rgba(16,185,129,0.4)', display: 'block' }}
            >
              Passer au Pro
            </Link>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <ReviewsSection />

      {/* FAQ */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: '760px', margin: '0 auto', padding: '50px 24px', background: '#080b16' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '34px', letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>Questions fréquentes</h2>
        </div>
        <dl>
          {faqItems.map((item, i) => (
            <div key={item.q} style={{ padding: '22px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
              <dt style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{item.q}</dt>
              <dd style={{ fontSize: '15px', color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* FINAL CTA */}
      <section id="cta" style={{ position: 'relative', zIndex: 1, maxWidth: '1040px', margin: '60px auto 0', padding: '0 24px 90px' }}>
        <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(140deg,#08160f,#04100a)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: '26px', padding: '64px 40px', textAlign: 'center' }}>
          <div style={{ position: 'absolute', bottom: '-160px', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.3), transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '42px', letterSpacing: '-0.03em', color: '#fff', margin: '0 0 16px' }}>Créez votre compte gratuit</h2>
            <p style={{ fontSize: '18px', color: '#6ee7b7', maxWidth: '520px', margin: '0 auto 34px', fontWeight: 500, lineHeight: 1.55 }}>Sauvegardez vos transcriptions, retrouvez votre historique et débloquez le post-traitement IA.</p>
            <Link
              to="/register"
              style={{ background: '#10b981', color: '#fff', textDecoration: 'none', padding: '16px 36px', borderRadius: '13px', fontSize: '17px', fontWeight: 700, boxShadow: '0 10px 32px rgba(16,185,129,0.5)', display: 'inline-block' }}
            >
              Créer un compte gratuit
            </Link>
            <p style={{ fontSize: '13.5px', color: '#8b8fa3', marginTop: '20px', fontWeight: 500 }}>Gratuit pour toujours · Sans carte bancaire</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '28px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '7px', background: 'linear-gradient(140deg,#10b981,#34d399)' }} />
              <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, color: '#fff', fontSize: '15px' }}>voclaire</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 12px', fontSize: '13px', color: '#9ca3af' }}>
              <Link to="/mentions-legales" style={{ color: '#9ca3af', textDecoration: 'none' }}>Mentions légales</Link>
              <Link to="/politique-de-confidentialite" style={{ color: '#9ca3af', textDecoration: 'none' }}>Confidentialité</Link>
              <Link to="/cgu" style={{ color: '#9ca3af', textDecoration: 'none' }}>CGU</Link>
              <Link to="/cgv" style={{ color: '#9ca3af', textDecoration: 'none' }}>CGV</Link>
              <Link to="/login" style={{ color: '#9ca3af', textDecoration: 'none' }}>Connexion</Link>
              <Link to="/register" style={{ color: '#9ca3af', textDecoration: 'none' }}>S'inscrire</Link>
            </div>
            <div style={{ fontSize: '13.5px', color: '#6b7280', fontWeight: 500 }}>© 2026 voclaire</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
