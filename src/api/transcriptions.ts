import type { ImprovedMode, TranscriptionOut } from '../types/transcription'

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
  num_speakers?: number
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
  // mémoire (important pour les fichiers longs : jusqu'à 2h par fichier en Free, sans plafond en Pro).
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
  source: 'file' | 'recording' = 'file',
  numSpeakers?: number
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
    num_speakers: numSpeakers,
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

export type ExportFormat = 'docx' | 'pdf' | 'pptx'
// raw : transcription brute ; improved : texte amélioré (correction / reformulation / résumé).
// Absent : comportement historique (Free : DOCX brut ; Pro : exports structurés).
export type ExportContent = 'raw' | 'improved'

const IMPROVED_SUFFIX: Record<ImprovedMode, string> = {
  correction: '-corrige',
  reformulation: '-reformule',
  résumé: '-resume',
}

// Lit le nom de fichier fixé par le backend dans Content-Disposition.
// filename* (RFC 5987, UTF-8 encodé en %XX) est prioritaire sur filename.
function parseContentDispositionFilename(header: string | null): string | null {
  if (!header) return null

  const extended = /filename\*\s*=\s*([^;]+)/i.exec(header)
  if (extended) {
    const raw = extended[1].trim().replace(/^"(.*)"$/, '$1')
    const encoded = raw.includes("''") ? raw.slice(raw.indexOf("''") + 2) : raw
    try {
      const decoded = decodeURIComponent(encoded)
      if (decoded) return sanitizeFilename(decoded)
    } catch {
      // Encodage invalide : on tente filename ci-dessous.
    }
  }

  const plain = /(?:^|;)\s*filename\s*=\s*("([^"]*)"|[^;]+)/i.exec(header)
  if (plain) {
    const value = (plain[2] ?? plain[1]).trim()
    if (value) return sanitizeFilename(value)
  }

  return null
}

// Garde uniquement le nom (jamais de chemin) pour l'attribut download.
function sanitizeFilename(name: string): string {
  return name.replace(/^.*[\\/]/, '')
}

// Secours si l'en-tête est absent : nom d'origine sans extension + suffixe selon le contenu.
function fallbackExportFilename(
  originalName: string,
  format: ExportFormat,
  content: ExportContent | undefined,
  improvedMode: ImprovedMode | null | undefined
): string {
  const dot = originalName.lastIndexOf('.')
  const base = (dot > 0 ? originalName.slice(0, dot) : originalName) || 'transcription'
  const suffix = content === 'improved' ? (improvedMode ? IMPROVED_SUFFIX[improvedMode] : '-retravaille') : ''
  return `${base}${suffix}.${format}`
}

// Unique point d'entrée des téléchargements d'export : appel API, nom du fichier, déclenchement.
// En cas d'erreur, lève une Error portant le detail renvoyé par l'API.
export async function downloadTranscriptionExport(
  transcription: Pick<TranscriptionOut, 'id' | 'file_name' | 'improved_mode'>,
  format: ExportFormat,
  content?: ExportContent
): Promise<void> {
  const params = new URLSearchParams({ format })
  if (content) params.set('content', content)

  const res = await fetch(`${BASE}/transcriptions/${transcription.id}/export?${params.toString()}`, {
    credentials: 'include',
  })

  if (!res.ok) {
    const data: unknown = await res.json().catch(() => null)
    const detail = typeof data === 'object' && data !== null && 'detail' in data ? data.detail : undefined
    throw new Error(typeof detail === 'string' && detail ? detail : `Erreur ${res.status}`)
  }

  const blob = await res.blob()
  const filename =
    parseContentDispositionFilename(res.headers.get('Content-Disposition')) ??
    fallbackExportFilename(transcription.file_name, format, content, transcription.improved_mode)

  downloadBlob(blob, filename)
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
