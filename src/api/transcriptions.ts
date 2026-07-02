import type { TranscriptionOut } from '../types/transcription'

const BASE = import.meta.env.VITE_BACKEND_VOCLAIRE_URL

export async function transcribeAudio(file: File): Promise<TranscriptionOut> {
  const body = new FormData()
  body.append('file', file)

  const res = await fetch(`${BASE}/transcriptions`, {
    method: 'POST',
    body,
    credentials: 'include',
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail ?? `Erreur ${res.status}`)
  }

  return res.json()
}

export async function getTranscriptions(): Promise<TranscriptionOut[]> {
  const res = await fetch(`${BASE}/transcriptions`, {
    credentials: 'include',
  })

  if (!res.ok) throw new Error(`Erreur ${res.status}`)

  return res.json()
}

export async function getTranscription(id: string): Promise<TranscriptionOut> {
  const res = await fetch(`${BASE}/transcriptions/${id}`, {
    credentials: 'include',
  })

  if (!res.ok) throw new Error(`Erreur ${res.status}`)

  return res.json()
}

export function pollTranscription(
  id: string,
  onUpdate: (t: TranscriptionOut) => void,
  intervalMs = 2000
): () => void {
  let stopped = false

  async function tick() {
    if (stopped) return
    try {
      const t = await getTranscription(id)
      if (stopped) return
      onUpdate(t)
      if (t.status === 'done' || t.status === 'error') return
    } catch {
      if (stopped) return
    }
    if (!stopped) timer = window.setTimeout(tick, intervalMs)
  }

  let timer = window.setTimeout(tick, intervalMs)

  return () => {
    stopped = true
    clearTimeout(timer)
  }
}

export async function improveTranscription(id: string, mode: string): Promise<TranscriptionOut> {
  const res = await fetch(`${BASE}/transcriptions/${id}/improve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
    credentials: 'include',
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail ?? `Erreur ${res.status}`)
  }

  return res.json()
}

export async function deleteTranscription(id: string): Promise<void> {
  const res = await fetch(`${BASE}/transcriptions/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!res.ok) throw new Error(`Erreur ${res.status}`)
}

export async function exportTranscription(id: string, format: 'docx' | 'pdf' | 'pptx'): Promise<Blob> {
  const res = await fetch(`${BASE}/transcriptions/${id}/export?format=${format}`, {
    credentials: 'include',
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { detail?: string }).detail ?? `Erreur ${res.status}`)
  }

  return res.blob()
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
