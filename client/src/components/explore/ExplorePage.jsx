import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Github, ArrowRight, Zap, Map } from 'lucide-react'

const EXAMPLES = [
  'facebook/react',
  'vercel/next.js',
  'shadcn-ui/ui',
  'supabase/supabase',
]

function parseGithubUrl(input) {
  // Handle: owner/repo, github.com/owner/repo, https://github.com/owner/repo
  const cleaned = input
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^github\.com\//, '')
    .replace(/\.git$/, '')
    .replace(/\/$/, '')

  const parts = cleaned.split('/')
  if (parts.length >= 2) {
    return { owner: parts[0], repo: parts[1] }
  }
  return null
}

export default function ExplorePage() {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleExplore(value) {
    const val = value || input
    const parsed = parseGithubUrl(val)
    if (!parsed) {
      setError('Enter a valid GitHub repo (e.g. facebook/react)')
      return
    }
    setError('')
    navigate(`/explore/${parsed.owner}/${parsed.repo}`)
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleExplore()
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1e1e1e] px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center">
            <Map size={12} className="text-white" />
          </div>
          <span className="text-white/70 text-sm font-medium">Vibemap</span>
        </button>
        <button
          onClick={() => navigate('/')}
          className="text-xs text-white/40 hover:text-white/70 transition-colors border border-[#2a2a2a] px-3 py-1.5 rounded-lg"
        >
          Sign in with GitHub
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-400 text-xs mb-6">
            <Zap size={10} />
            No sign in required for public repos
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            Explore any public repo
          </h1>
          <p className="text-white/40 text-sm mb-10 leading-relaxed">
            Paste a GitHub URL and get an AI-powered semantic map instantly
          </p>

          {/* Input */}
          <div className="relative mb-3">
            <Github size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              autoFocus
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError('') }}
              onKeyDown={handleKey}
              placeholder="github.com/facebook/react or facebook/react"
              className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl pl-10 pr-12 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
            <button
              onClick={() => handleExplore()}
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-30 transition-all"
            >
              <ArrowRight size={14} />
            </button>
          </div>

          {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

          {/* Examples */}
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => handleExplore(ex)}
                className="text-xs px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-white/40 hover:text-white/70 hover:border-[#3a3a3a] transition-colors font-mono"
              >
                {ex}
              </button>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
