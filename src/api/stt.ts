const ML_API = import.meta.env.VITE_ML_API_URL

export async function transcribeAudio(file: File): Promise<string> {
  const body = new FormData()
  body.append('file', file)

  const res = await fetch(`${ML_API}/stt`, { method: 'POST', body })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail ?? `Erreur ${res.status}`)
  }

  const json = await res.json()
  return json.text
}
