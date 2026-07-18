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

function speakerColor(speaker: string) {
  const match = speaker.match(/(\d+)/)
  const index = match ? parseInt(match[1], 10) : 0
  return SPEAKER_COLORS[index % SPEAKER_COLORS.length]
}

function speakerLabel(speaker: string) {
  const match = speaker.match(/(\d+)/)
  const number = match ? parseInt(match[1], 10) : 0
  return `Intervenant ${number + 1}`
}

function formatTimestamp(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function DiarizedTranscript({ segments }: DiarizedTranscriptProps) {
  return (
    <div className="flex flex-col gap-4">
      {segments.map((segment, i) => {
        const color = speakerColor(segment.speaker)
        return (
          <p key={i} className="m-0">
            <span className={`font-bold ${color.text}`}>{speakerLabel(segment.speaker)}</span>
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
