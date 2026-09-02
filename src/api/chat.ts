import type { ChatMessage } from '../types/chat'

const BASE = import.meta.env.VITE_BACKEND_VOCLAIRE_URL

export async function sendChatMessage(message: string, history: ChatMessage[]): Promise<string> {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ message, history }),
  })
  if (!res.ok) {
    if (res.status === 429) throw new Error('Trop de messages d\'affilée. Réessayez dans une minute.')
    throw new Error('Le chat est momentanément indisponible.')
  }
  const data = (await res.json()) as { reply: string }
  return data.reply
}
