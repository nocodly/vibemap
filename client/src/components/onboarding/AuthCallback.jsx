import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore.js'
import { Loader } from '../ui/Loader.jsx'

export default function AuthCallback() {
  const [error, setError] = useState(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setGithubToken } = useAuthStore()

  useEffect(() => {
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setError('GitHub authorization was denied.')
      return
    }

    if (!code) {
      setError('No authorization code received.')
      return
    }

    // Exchange code for token via our server
    fetch('/auth/github/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setGithubToken(data.access_token)
        navigate('/repos', { replace: true })
      })
      .catch((err) => {
        setError(err.message || 'Authentication failed.')
      })
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="text-accent hover:underline text-sm"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="text-center">
        <Loader />
        <p className="text-text-secondary text-sm mt-4">Connecting to GitHub...</p>
      </div>
    </div>
  )
}
