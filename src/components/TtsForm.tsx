import { useState, type SubmitEvent } from 'react'
import { generateAudio } from '../api/tts'

export default function TtsForm() {
  const [text, setText] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setAudioUrl(null)

    try {
      const url = await generateAudio({ text })
      setAudioUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-gray-900 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-white mb-8">voclaire</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Entrez votre texte ici..."
            rows={5}
            required
            className="w-full rounded-xl bg-gray-800 text-white placeholder-gray-500 p-4 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <button
            type="submit"
            disabled={loading || text.trim() === ''}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
          >
            {loading ? 'Génération en cours...' : "Générer l'audio"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-red-400 text-sm">{error}</p>
        )}

        {audioUrl && (
          <div className="mt-6">
            <audio controls src={audioUrl} className="w-full" />
          </div>
        )}
      </div>
    </div>
  )
}
