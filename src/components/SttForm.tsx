import React, { useState } from 'react'
import { transcribeAudio } from '../api/stt'

export default function SttForm() {
  const [file, setFile] = useState<File | null>(null)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)
    setTranscript(null)

    try {
      const text = await transcribeAudio(file)
      setTranscript(text)
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
          <label className="flex flex-col gap-2">
            <span className="text-gray-400 text-sm">Fichier audio</span>
            <input
              type="file"
              accept="audio/*"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-violet-600 file:text-white file:cursor-pointer hover:file:bg-violet-500"
            />
          </label>

          <button
            type="submit"
            disabled={loading || !file}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
          >
            {loading ? 'Transcription en cours...' : 'Transcrire'}
          </button>
        </form>

        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

        {transcript && (
          <div className="mt-6">
            <p className="text-gray-400 text-sm mb-2">Transcription</p>
            <p className="text-white bg-gray-800 rounded-xl p-4 leading-relaxed">{transcript}</p>
          </div>
        )}
      </div>
    </div>
  )
}
