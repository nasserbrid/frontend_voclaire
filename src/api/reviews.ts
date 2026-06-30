import type { ReviewOut } from '../types/review'

const BASE = import.meta.env.VITE_BACKEND_VOCLAIRE_URL

export async function getReviews(): Promise<ReviewOut[]> {
  const res = await fetch(`${BASE}/reviews`)
  if (!res.ok) return []
  return res.json()
}

export async function submitReview(content: string, rating: number): Promise<ReviewOut> {
  const res = await fetch(`${BASE}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content, rating }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail ?? "Erreur lors de la soumission de l'avis")
  }
  return res.json()
}
