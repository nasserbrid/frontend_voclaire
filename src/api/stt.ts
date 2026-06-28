import type { STTResponse } from '../types'

const BASE_URL = import.meta.env.VITE_ML_API_URL as string

export async function transcribeAudio(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${BASE_URL}/stt`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Erreur API ${response.status}`)
  }

  const data: STTResponse = await response.json()
  return data.text
}
