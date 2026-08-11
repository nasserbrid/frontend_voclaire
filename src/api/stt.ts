const BACKEND_URL = import.meta.env.VITE_BACKEND_VOCLAIRE_URL

export async function transcribeAudio(file: File): Promise<string> {
  const body = new FormData()
  body.append('file', file)

  const res = await fetch(`${BACKEND_URL}/demo/stt`, { method: 'POST', body })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail ?? `Erreur ${res.status}`)
  }

  const json = await res.json()
  return json.text
}
