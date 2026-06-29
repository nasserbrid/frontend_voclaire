export interface TranscriptionOut {
  id: string
  text: string
  file_name: string
  file_size: number
  created_at: string
  improved_text?: string
}
