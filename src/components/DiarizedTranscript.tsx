import type { TranscriptionSegment } from '../types/transcription'

interface DiarizedTranscriptProps {
  segments: TranscriptionSegment[]
}

const SPEAKER_COLORS = [
  { badge: 'bg-emerald-400/15 text-emerald-400', dot: 'bg-emerald-400', text: 'text-emerald-400' },
  { badge: 'bg-blue-400/15 text-blue-400', dot: 'bg-blue-400', text: 'text-blue-400' },
  { badge: 'bg-purple-400/15 text-purple-400', dot: 'bg-purple-400', text: 'text-purple-400' },
  { badge: 'bg-amber-400/15 text-amber-400', dot: 'bg-amber-400', text: 'text-amber-400' },
  { badge: 'bg-pink-400/15 text-pink-400', dot: 'bg-pink-400', text: 'text-pink-400' },
  { badge: 'bg-sky-400/15 text-sky-400', dot: 'bg-sky-400', text: 'text-sky-400' },
]

function buildSpeakerOrder(segments: TranscriptionSegment[]): Map<string, number> {
  // Numérote chaque speaker distinct selon son ordre d'apparition réel dans la
  // transcription (pas selon le numéro brut du label pyannote, qui ne commence
  // pas forcément à SPEAKER_00 pour le premier/seul intervenant détecté).
  const order = new Map<string, number>()
  for (const segment of segments) {
    if (!order.has(segment.speaker)) {
      order.set(segment.speaker, order.size)
    }
  }
  return order
}

function formatTimestamp(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function DiarizedTranscript({ segments }: DiarizedTranscriptProps) {
  const speakerOrder = buildSpeakerOrder(segments)

  return (
    <div className="flex flex-col gap-4">
      {segments.map((segment, i) => {
        const index = speakerOrder.get(segment.speaker) ?? 0
        const color = SPEAKER_COLORS[index % SPEAKER_COLORS.length]
        return (
          <p key={i} className="m-0">
            <span className={`font-bold ${color.text}`}>Intervenant {index + 1}</span>
            <span className="text-gray-500"> · </span>
            <span className="text-xs text-gray-500">{formatTimestamp(segment.start)}</span>
            <br />
            <span className="text-[15px] leading-relaxed" style={{ color: '#d1d5db' }}>{segment.text}</span>
          </p>
        )
      })}
    </div>
  )
}
