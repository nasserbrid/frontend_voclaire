'use no memo'
import { useState, useEffect, useRef } from 'react'
import posthog from 'posthog-js'
import { sendChatMessage } from '../api/chat'
import type { ChatMessage } from '../types/chat'

const STORAGE_KEY = 'voclaire_chat'

const SUGGESTIONS = [
  'Comment enregistrer une réunion ?',
  'Quelle est la limite du plan gratuit ?',
  'Comment passer en Pro ?',
]

function loadHistory(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ChatMessage[]) : []
  } catch {
    return []
  }
}

function capture(event: string) {
  try {
    posthog.capture(event)
  } catch {
    // analytics best-effort, ne doit jamais faire échouer l'UI
  }
}

export default function OnboardingChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasOpenedRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      // sessionStorage indisponible (mode privé) — perte silencieuse acceptable
    }
  }, [messages])

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  function handleOpen() {
    setOpen(true)
    if (!hasOpenedRef.current) {
      hasOpenedRef.current = true
      capture('chat_opened')
    }
  }

  async function handleSend(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const priorHistory = messages
    setMessages([...priorHistory, { role: 'user', content: trimmed }])
    setInput('')
    setError(null)
    setLoading(true)
    capture('chat_message_sent')

    try {
      const reply = await sendChatMessage(trimmed, priorHistory)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Le chat est momentanément indisponible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {!open && (
        <button
          ref={toggleRef}
          onClick={handleOpen}
          aria-label="Ouvrir l'aide"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 900,
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#10b981,#34d399)',
            border: 'none',
            boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}
        >
          💬
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Assistant voclaire"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 900,
            width: '340px',
            maxWidth: 'calc(100vw - 32px)',
            height: '460px',
            background: '#080b16',
            border: '1px solid #10b981',
            borderRadius: '16px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Manrope', sans-serif",
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: '15px', color: '#fff' }}>
              Assistant voclaire
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer l'aide"
              style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '4px' }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.length === 0 && (
              <div>
                <p style={{ fontSize: '14px', color: '#d1d5db', margin: '0 0 14px', lineHeight: 1.6 }}>
                  Bonjour 👋 Je peux répondre à vos questions sur voclaire (fonctionnalités, quotas, tarifs). Que voulez-vous savoir ?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      style={{
                        textAlign: 'left',
                        background: 'rgba(16,185,129,0.08)',
                        border: '1px solid rgba(16,185,129,0.25)',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        color: '#34d399',
                        fontSize: '13px',
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.role === 'user' ? 'linear-gradient(135deg,#10b981,#34d399)' : 'rgba(255,255,255,0.06)',
                  color: m.role === 'user' ? '#fff' : '#d1d5db',
                  borderRadius: '12px',
                  padding: '9px 13px',
                  fontSize: '14px',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.content}
              </div>
            ))}

            {loading && (
              <div style={{ alignSelf: 'flex-start', color: '#9ca3af', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#34d399', borderRadius: '999px', display: 'inline-block', animation: 'vc-spin 0.7s linear infinite' }} />
                L'assistant répond…
              </div>
            )}

            {error && (
              <p style={{ fontSize: '13px', color: '#f87171', margin: 0 }}>{error}</p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend(input)
            }}
            style={{ display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Écrivez votre question…"
              style={{
                flex: 1,
                background: '#05070f',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#d1d5db',
                fontFamily: "'Manrope', sans-serif",
                fontSize: '14px',
                padding: '9px 12px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: loading || !input.trim() ? 'rgba(16,185,129,0.4)' : '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '0 16px',
                fontSize: '14px',
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              Envoyer
            </button>
          </form>
        </div>
      )}
    </>
  )
}
