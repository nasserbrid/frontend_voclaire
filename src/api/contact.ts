import type { ContactOut } from '../types/contact'

const BASE = import.meta.env.VITE_BACKEND_VOCLAIRE_URL

export async function submitContact(subject: string, message: string): Promise<ContactOut> {
  const res = await fetch(`${BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ subject, message }),
  })
  if (!res.ok) throw new Error('Erreur lors de l\'envoi du message')
  return res.json()
}
