import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from './store/authStore.js'
import { getUser } from './services/github.js'

import LandingPage from './components/onboarding/LandingPage.jsx'
import AuthCallback from './components/onboarding/AuthCallback.jsx'
import RepoSelect from './components/onboarding/RepoSelect.jsx'
import AppShell from './components/layout/AppShell.jsx'

export default function App() {
  const { githubToken, setUser, isAuthenticated } = useAuthStore()

  // Fetch GitHub user profile once token is set
  useEffect(() => {
    if (!githubToken) return
    getUser(githubToken)
      .then(setUser)
      .catch(() => {}) // if token expired, user can re-auth
  }, [githubToken])

  return (
    <Routes>
      <Route path="/" element={
        isAuthenticated() ? <Navigate to="/repos" replace /> : <LandingPage />
      } />

      {/* GitHub OAuth callback */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected routes */}
      <Route path="/repos" element={
        isAuthenticated() ? <RepoSelect /> : <Navigate to="/" replace />
      } />

      <Route path="/repo/:owner/:repo/*" element={
        isAuthenticated() ? <AppShell /> : <Navigate to="/" replace />
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
