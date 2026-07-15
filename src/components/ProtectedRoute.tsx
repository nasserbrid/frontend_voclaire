import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent"
          style={{ animation: 'vc-spin 0.8s linear infinite' }}
        />
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />

  return <>{children}</>
}
