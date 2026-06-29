import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function GoogleCallbackPage() {
  const { setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getMe()
      .then(user => {
        setUser(user)
        navigate('/app', { replace: true })
      })
      .catch(() => {
        navigate('/login', { replace: true })
      })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#030712' }}>
      <div
        className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent"
        style={{ animation: 'vc-spin 0.8s linear infinite' }}
      />
    </div>
  )
}
