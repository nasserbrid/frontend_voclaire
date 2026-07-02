import React, { useEffect, useRef, useState } from 'react'
import { transcribeAudio, pollTranscription } from '../api/transcriptions'
import type { TranscriptionOut } from '../types/transcription'

interface SttFormProps {
  onTranscribed?: (t: TranscriptionOut) => void
}

export default function SttForm({ onTranscribed }: SttFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [copied, setCopied] = useState(false)
  const [meta, setMeta] = useState('')

  const stopPollRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => stopPollRef.current?.()
  }, [])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) { setFile(f); setError(null); setTranscript(null) }
  }

  function onDragOver(e: React.DragEvent) { e.preventDefault(); setDragging(true) }
  function onDragLeave(e: React.DragEvent) { e.preventDefault(); setDragging(false) }
  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f && f.type.startsWith('audio')) { setFile(f); setError(null); setTranscript(null) }
    else setError('Merci de déposer un fichier audio.')
  }

  async function handleTranscribe() {
    if (!file || loading) return
    setLoading(true); setError(null); setTranscript(null)
    const t0 = Date.now()
    try {
      const result = await transcribeAudio(file)

      if (result.status === 'processing') {
        stopPollRef.current = pollTranscription(result.id, (t) => {
          if (t.status === 'done') {
            setTranscript(t.text)
            setMeta(((Date.now() - t0) / 1000).toFixed(1) + 's')
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
      setMeta(((Date.now() - t0) / 1000).toFixed(1) + 's')
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

  return (
    <div>
      {/* Dropzone */}
      <label
        htmlFor="stt-file"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        style={{
          display: 'block',
          textAlign: 'center',
          padding: '34px 24px',
          borderRadius: '16px',
          border: `1.5px dashed ${dragging ? '#34d399' : 'rgba(16,185,129,0.4)'}`,
          background: dragging ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.04)',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <input id="stt-file" type="file" accept="audio/*" onChange={onFileChange} style={{ display: 'none' }} />
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16,185,129,0.16)', border: '1px solid rgba(16,185,129,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '20px' }}>
            {[8, 16, 11, 18, 7].map((h, i) => (
              <span key={i} style={{ width: '3px', height: `${h}px`, background: '#34d399', borderRadius: '2px', display: 'block' }} />
            ))}
          </div>
        </div>
        <div style={{ fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '6px' }}>
          {file ? file.name : (dragging ? 'Déposez le fichier ici' : 'Choisir un fichier audio')}
        </div>
        <div style={{ fontSize: '14px', color: '#9ca3af', fontWeight: 500 }}>
          {file
            ? `${Math.round(file.size / 1024)} Ko · prêt à transcrire`
            : 'MP3 · WAV · M4A · OGG · FLAC · ou glissez-déposez'}
        </div>
      </label>

      {/* Bouton */}
      <button
        onClick={handleTranscribe}
        disabled={!file || loading}
        style={{
          marginTop: '18px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '15px',
          borderRadius: '13px',
          border: 'none',
          fontFamily: "'Manrope', sans-serif",
          fontSize: '16px',
          fontWeight: 700,
          cursor: (!file || loading) ? 'not-allowed' : 'pointer',
          background: (!file || loading) ? 'rgba(16,185,129,0.4)' : '#10b981',
          color: '#fff',
          transition: 'background 0.2s',
          boxShadow: (!file || loading) ? 'none' : '0 8px 24px rgba(16,185,129,0.4)',
        }}
      >
        {loading && (
          <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '999px', display: 'inline-block', animation: 'vc-spin 0.7s linear infinite' }} />
        )}
        {loading ? 'Transcription en cours…' : 'Transcrire'}
      </button>

      {/* Erreur */}
      {error && (
        <div style={{ marginTop: '14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500 }}>
          {error}
        </div>
      )}

      {/* Résultat */}
      {transcript && (
        <div style={{ marginTop: '22px', animation: 'vc-fadeup 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '999px', background: '#22c55e', display: 'inline-block' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#e5e7eb', letterSpacing: '0.02em' }}>Transcription</span>
              {meta && <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>· {meta}</span>}
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
    </div>
  )
}
