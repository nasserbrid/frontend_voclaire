import type { TranscriptionSegment } from '../types/transcription'

interface DiarizedTranscriptProps {
  segments: TranscriptionSegment[]
}

const SPEAKER_COLORS = [
  { badge: 'bg-emerald-400/15 text-emerald-400', dot: 'bg-emerald-400' },
  { badge: 'bg-blue-400/15 text-blue-400', dot: 'bg-blue-400' },
  { badge: 'bg-purple-400/15 text-purple-400', dot: 'bg-purple-400' },
  { badge: 'bg-amber-400/15 text-amber-400', dot: 'bg-amber-400' },
  { badge: 'bg-pink-400/15 text-pink-400', dot: 'bg-pink-400' },
  { badge: 'bg-sky-400/15 text-sky-400', dot: 'bg-sky-400' },
]

function speakerColor(speaker: string) {
  const match = speaker.match(/(\d+)/)
  const index = match ? parseInt(match[1], 10) : 0
  return SPEAKER_COLORS[index % SPEAKER_COLORS.length]
}

function formatTimestamp(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function DiarizedTranscript({ segments }: DiarizedTranscriptProps) {
  return (
    <div className="flex flex-col gap-3">
      {segments.map((segment, i) => {
        const color = speakerColor(segment.speaker)
        return (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${color.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
                {segment.speaker}
              </span>
              <span className="text-xs text-gray-500">{formatTimestamp(segment.start)}</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-300">{segment.text}</p>
          </div>
        )
      })}
    </div>
  )
}
