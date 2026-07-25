import type { TranscriptionOut } from '../types/transcription'

const BASE = import.meta.env.VITE_BACKEND_VOCLAIRE_URL

interface PresignResponse {
  upload_url: string
  r2_key: string
}

interface ConfirmParams {
  r2_key: string
  file_name: string
  content_type: string
  file_size: number
  duration_seconds: number
  source: 'file' | 'recording'
}

async function presignUpload(fileName: string, contentType: string): Promise<PresignResponse> {
  const res = await fetch(`${BASE}/transcriptions/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_name: fileName, content_type: contentType }),
    credentials: 'include',
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail ?? `Erreur ${res.status}`)
  }

  return res.json()
}

async function uploadToR2(uploadUrl: string, file: File): Promise<void> {
  // Pas de credentials: 'include' ici — c'est une URL Cloudflare R2, pas notre backend,
  // le cookie JWT n'a rien à y faire.
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'audio/mpeg' },
    body: file,
  })

  if (!res.ok) {
    throw new Error("Échec de l'envoi du fichier audio.")
  }
}

async function confirmTranscription(params: ConfirmParams): Promise<TranscriptionOut> {
  const res = await fetch(`${BASE}/transcriptions/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    credentials: 'include',
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail ?? `Erreur ${res.status}`)
  }

  return res.json()
}

function getAudioDurationSeconds(file: File): Promise<number> {
  // Lecture des métadonnées via un <audio> caché — léger, pas de décodage complet en
  // mémoire (important pour les gros fichiers Pro, jusqu'à 3h).
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio')
    const url = URL.createObjectURL(file)
    audio.preload = 'metadata'
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(audio.duration)
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Impossible de lire la durée du fichier audio."))
    }
    audio.src = url
  })
}

export async function transcribeAudio(
  file: File,
  knownDurationSeconds?: number,
  source: 'file' | 'recording' = 'file'
): Promise<TranscriptionOut> {
  // knownDurationSeconds : permet à un appelant qui connaît déjà la durée exacte
  // (ex: Dictaphone, qui a son propre timer) de l'utiliser directement plutôt que
  // de la redétecter via <audio> — évite une détection peu fiable sur les
  // blobs webm produits par MediaRecorder.
  const durationSeconds = knownDurationSeconds ?? (await getAudioDurationSeconds(file))
  const contentType = file.type || 'audio/mpeg'

  const { upload_url, r2_key } = await presignUpload(file.name, contentType)
  await uploadToR2(upload_url, file)

  return confirmTranscription({
    r2_key,
    file_name: file.name,
    content_type: contentType,
    file_size: file.size,
    duration_seconds: durationSeconds,
    source,
  })
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
