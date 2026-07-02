import { useEffect, useRef, useState } from 'react'
import { transcribeAudio, pollTranscription } from '../api/transcriptions'
import { getDictaphoneUnsupportedReason } from '../utils/mediaSupport'
import type { TranscriptionOut } from '../types/transcription'

interface DictaphoneProps {
  onTranscribed?: (t: TranscriptionOut) => void
  maxMinutes: number
}

export default function Dictaphone({ onTranscribed, maxMinutes }: DictaphoneProps) {
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [micWarning, setMicWarning] = useState<string | null>(null)
  const [unsupportedReason] = useState(getDictaphoneUnsupportedReason)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const displayStreamRef = useRef<MediaStream | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const stopPollRef = useRef<(() => void) | null>(null)

  function cleanupStreams() {
    displayStreamRef.current?.getTracks().forEach((t) => t.stop())
    micStreamRef.current?.getTracks().forEach((t) => t.stop())
    audioContextRef.current?.close()
    displayStreamRef.current = null
    micStreamRef.current = null
    audioContextRef.current = null
  }

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current)
      cleanupStreams()
      stopPollRef.current?.()
    }
  }, [])

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setRecording(false)
  }

  async function startRecording() {
    setError(null)
    setMicWarning(null)
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true })
      displayStream.getVideoTracks().forEach((track) => {
        track.stop()
        displayStream.removeTrack(track)
      })

      if (displayStream.getAudioTracks().length === 0) {
        displayStream.getTracks().forEach((t) => t.stop())
        setError("Aucun audio détecté. Repartagez en sélectionnant un onglet et en cochant « Partager l'audio de l'onglet ».")
        return
      }

      let micStream: MediaStream | null = null
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch {
        setMicWarning("Micro non autorisé — seule la voix des autres participants sera enregistrée.")
      }

      const audioContext = new AudioContext()
      const destination = audioContext.createMediaStreamDestination()
      audioContext.createMediaStreamSource(displayStream).connect(destination)
      if (micStream) audioContext.createMediaStreamSource(micStream).connect(destination)

      displayStreamRef.current = displayStream
      micStreamRef.current = micStream
      audioContextRef.current = audioContext

      chunksRef.current = []
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg'
      const mediaRecorder = new MediaRecorder(destination.stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setAudioFile(new File([blob], 'reunion.webm', { type: mimeType }))
        cleanupStreams()
      }
      displayStream.getAudioTracks()[0].onended = () => stopRecording()

      mediaRecorder.start(1000)
      setAudioFile(null)
      setElapsed(0)
      setTranscript(null)
      setRecording(true)

      let localElapsed = 0
      timerRef.current = window.setInterval(() => {
        localElapsed += 1
        setElapsed(localElapsed)
        if (localElapsed >= maxMinutes * 60) stopRecording()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de démarrer l'enregistrement")
    }
  }

  async function handleTranscribe() {
    if (!audioFile || loading) return
    setLoading(true)
    setError(null)
    setTranscript(null)
    try {
      const result = await transcribeAudio(audioFile)

      if (result.status === 'processing') {
        stopPollRef.current = pollTranscription(result.id, (t) => {
          if (t.status === 'done') {
            setTranscript(t.text)
            setLoading(false)
            onTranscribed?.(t)
          } else if (t.status === 'error') {
            setError('Erreur lors de la transcription')
            setLoading(false)
          }
        })
        return
      }

      setTranscript(result.text)
      setLoading(false)
      onTranscribed?.(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la transcription')
      setLoading(false)
    }
  }

  function onCopy() {
    if (transcript && navigator.clipboard) navigator.clipboard.writeText(transcript)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  function handleDownload() {
    if (!audioFile) return
    const url = URL.createObjectURL(audioFile)
    const a = document.createElement('a')
    a.href = url
    a.download = `reunion-${new Date().toISOString().slice(0, 10)}.webm`
    a.click()
    URL.revokeObjectURL(url)
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const remaining = maxMinutes * 60 - elapsed

  if (unsupportedReason) {
    return (
      <div style={{ textAlign: 'center', padding: '34px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
        <div style={{ fontSize: '14px', color: '#9ca3af', fontWeight: 500 }}>{unsupportedReason}</div>
      </div>
    )
  }

  return (
    <div>
      {!recording && !audioFile && (
        <div style={{ textAlign: 'center', padding: '34px 24px', borderRadius: '16px', border: '1.5px dashed rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.04)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16,185,129,0.16)', border: '1px solid rgba(16,185,129,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '999px', background: '#ef4444', display: 'block' }} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>
            Démarrer l'enregistrement
          </div>
          <div style={{ fontSize: '14px', color: '#9ca3af', fontWeight: 500, marginBottom: '18px' }}>
            Partagez l'onglet de votre réunion (Meet, Teams, Zoom) en cochant « Partager l'audio de l'onglet »
          </div>
          <button
            onClick={startRecording}
            style={{ padding: '13px 26px', borderRadius: '12px', border: 'none', fontFamily: "'Manrope', sans-serif", fontSize: '15px', fontWeight: 700, cursor: 'pointer', background: '#10b981', color: '#fff', boxShadow: '0 8px 24px rgba(16,185,129,0.4)' }}
          >
            Démarrer l'enregistrement
          </button>
        </div>
      )}

      {recording && (
        <div style={{ textAlign: 'center', padding: '34px 24px', borderRadius: '16px', border: '1.5px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '14px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '999px', background: '#ef4444', display: 'inline-block', animation: 'vc-pulse 1.2s ease-in-out infinite' }} />
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '26px', color: '#fff', letterSpacing: '0.02em' }}>{formatTime(elapsed)}</span>
          </div>
          {remaining <= 120 && remaining > 0 && (
            <div style={{ fontSize: '13px', color: '#fca5a5', fontWeight: 600, marginBottom: '14px' }}>
              Limite atteinte dans {Math.ceil(remaining / 60)} min
            </div>
          )}
          <button
            onClick={stopRecording}
            style={{ padding: '13px 26px', borderRadius: '12px', border: 'none', fontFamily: "'Manrope', sans-serif", fontSize: '15px', fontWeight: 700, cursor: 'pointer', background: '#ef4444', color: '#fff', boxShadow: '0 8px 24px rgba(239,68,68,0.35)' }}
          >
            Arrêter
          </button>
        </div>
      )}

      {!recording && audioFile && (
        <div style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.04)' }}>
          <div style={{ fontSize: '14px', color: '#e5e7eb', fontWeight: 600, marginBottom: '4px' }}>
            Enregistrement prêt · {formatTime(elapsed)}
          </div>
          <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500, marginBottom: '18px' }}>
            {Math.round(audioFile.size / 1024)} Ko
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleTranscribe}
              disabled={loading}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '13px', borderRadius: '12px', border: 'none', fontFamily: "'Manrope', sans-serif", fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', background: loading ? 'rgba(16,185,129,0.4)' : '#10b981', color: '#fff', boxShadow: loading ? 'none' : '0 8px 24px rgba(16,185,129,0.4)' }}
            >
              {loading && (
                <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '999px', display: 'inline-block', animation: 'vc-spin 0.7s linear infinite' }} />
              )}
              {loading ? 'Transcription en cours…' : 'Transcrire maintenant'}
            </button>
            <button
              onClick={handleDownload}
              style={{ padding: '13px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', fontFamily: "'Manrope', sans-serif", fontSize: '15px', fontWeight: 600, cursor: 'pointer', background: 'transparent', color: '#e5e7eb' }}
            >
              Télécharger l'audio
            </button>
          </div>
        </div>
      )}

      {transcript && (
        <div style={{ marginTop: '22px', animation: 'vc-fadeup 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '999px', background: '#22c55e', display: 'inline-block' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#e5e7eb', letterSpacing: '0.02em' }}>Transcription</span>
            </div>
            <button
              onClick={onCopy}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#6ee7b7', padding: '6px 12px', borderRadius: '9px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Manrope', sans-serif" }}
            >
              {copied ? 'Copié ✓' : 'Copier'}
            </button>
          </div>
          <div style={{ background: '#05070f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px 20px', fontSize: '15.5px', lineHeight: 1.7, color: '#d1d5db', fontWeight: 500, whiteSpace: 'pre-wrap' }}>
            {transcript}
          </div>
        </div>
      )}

      {micWarning && (
        <div style={{ marginTop: '14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500 }}>
          {micWarning}
        </div>
      )}

      {error && (
        <div style={{ marginTop: '14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500 }}>
          {error}
        </div>
      )}
    </div>
  )
}
