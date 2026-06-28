const BASE_URL = import.meta.env.VITE_ML_API_URL as string

export async function apiPost(path: string, body: unknown): Promise<Response> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Erreur API ${response.status}`)
  }

  return response
}
