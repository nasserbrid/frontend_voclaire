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

export async function deleteTranscription(id: string): Promise<void> {
  const res = await fetch(`${BASE}/transcriptions/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!res.ok) throw new Error(`Erreur ${res.status}`)
}
