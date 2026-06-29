import { useState, useEffect } from 'react'

type ToastData = { id: number; message: string }

export function showToast(message: string) {
  window.dispatchEvent(new CustomEvent('vc:toast', { detail: message }))
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  useEffect(() => {
    function onToast(e: Event) {
      const message = (e as CustomEvent<string>).detail
      const id = Date.now()
      setToasts(prev => [...prev, { id, message }])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 3000)
    }
    window.addEventListener('vc:toast', onToast)
    return () => window.removeEventListener('vc:toast', onToast)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999 }}>
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            background: '#10b981',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 12,
            fontFamily: 'Manrope, sans-serif',
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
