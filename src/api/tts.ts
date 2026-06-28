import { apiPost } from './client'
import type { TtsRequest } from '../types'

export async function generateAudio(request: TtsRequest): Promise<string> {
  const response = await apiPost('/tts', request)
  const buffer = await response.arrayBuffer()
  const blob = new Blob([buffer], { type: 'audio/wav' })
  return URL.createObjectURL(blob)
}
