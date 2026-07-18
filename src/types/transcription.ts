export interface StructuredContent {
  titre: string
  introduction: string
  points: string[]
  conclusion: string
}

export interface TranscriptionSegment {
  speaker: string
  text: string
  start: number
  end: number
}

export interface TranscriptionOut {
  id: string
  status: string
  text: string | null
  file_name: string
  file_size: number
  created_at: string
  improved_text?: string
  structured_content?: StructuredContent
  segments?: TranscriptionSegment[]
}
