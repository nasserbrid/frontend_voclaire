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

// Mode du dernier post-traitement qui a produit improved_text.
// null : texte amélioré absent, ou produit avant l'ajout de ce champ côté backend.
export type ImprovedMode = 'correction' | 'reformulation' | 'résumé'

export interface TranscriptionOut {
  id: string
  status: string
  text: string | null
  file_name: string
  file_size: number
  created_at: string
  improved_text?: string
  improved_mode?: ImprovedMode | null
  structured_content?: StructuredContent
  segments?: TranscriptionSegment[]
}
