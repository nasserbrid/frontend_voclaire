import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './components/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AppPage from './pages/AppPage'
import PricingPage from './pages/PricingPage'
import MentionsLegalesPage from './pages/MentionsLegalesPage'
import PolitiqueConfidentialitePage from './pages/PolitiqueConfidentialitePage'
import CguPage from './pages/CguPage'
import CgvPage from './pages/CgvPage'
import ContactPage from './pages/ContactPage'

// Lu une seule fois au chargement du module (avant tout montage React/StrictMode)
const _googleAuthJustCompleted = sessionStorage.getItem('vc:oauth_pending') === '1'
if (_googleAuthJustCompleted) sessionStorage.removeItem('vc:oauth_pending')

function RootPage() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) {
    return (
      <Navigate
        to="/app"
        state={_googleAuthJustCompleted ? { toast: 'Bienvenue dans voclaire !' } : undefined}
        replace
      />
    )
  }
  return <LandingPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
          <Route path="/politique-de-confidentialite" element={<PolitiqueConfidentialitePage />} />
          <Route path="/cgu" element={<CguPage />} />
          <Route path="/cgv" element={<CgvPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <ContactPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
