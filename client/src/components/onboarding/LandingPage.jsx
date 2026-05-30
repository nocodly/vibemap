import { motion } from 'framer-motion'
import { Github, Map, FileCode, MessageSquare, Zap } from 'lucide-react'

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID
const GITHUB_OAUTH_URL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/callback')}`

const features = [
  {
    icon: Map,
    title: 'Semantic Map',
    desc: 'Your project broken into logical blocks — Auth, Database, API, UI. See the big picture instantly.',
  },
  {
    icon: FileCode,
    title: 'Smart File Tree',
    desc: 'Browse any file with AI explanations. Understand what every function does without reading all the code.',
  },
  {
    icon: MessageSquare,
    title: 'Codebase Agent',
    desc: 'Ask anything about your repo. The AI knows your entire project and answers with real file references.',
  },
  {
    icon: Zap,
    title: 'Bring Your Own AI',
    desc: 'Use your own API key — Anthropic, OpenAI, or 200+ models via OpenRouter. You control the costs.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      {/* Header */}
      <header className="border-b border-bg-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <Map size={14} className="text-white" />
          </div>
          <span className="font-semibold text-text-primary">Vibemap</span>
        </div>
        <a
          href="https://github.com/nocodly/vibemap"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-secondary hover:text-text-primary text-sm transition-colors flex items-center gap-1.5"
        >
          <Github size={14} />
          GitHub
        </a>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-medium mb-6">
            <Zap size={10} />
            Open source · Bring your own AI
          </div>

          <h1 className="text-5xl font-bold text-text-primary leading-tight mb-4">
            Understand any codebase<br />
            <span className="text-gradient">in minutes</span>
          </h1>

          <p className="text-text-secondary text-lg mb-10 leading-relaxed">
            Connect your GitHub repo and get an AI-powered map of your project.
            Ask questions, explore files, understand architecture — instantly.
          </p>

          <a
            href={GITHUB_OAUTH_URL}
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-white text-gray-900 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Github size={18} />
            Connect GitHub to get started
          </a>

          <p className="text-text-muted text-xs mt-3">
            Free to use · Your code never leaves your computer
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full mt-20"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="p-5 rounded-xl border border-bg-border bg-bg-surface hover:border-accent/30 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                <f.icon size={15} className="text-accent" />
              </div>
              <h3 className="font-semibold text-text-primary text-sm mb-1">{f.title}</h3>
              <p className="text-text-secondary text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <footer className="border-t border-bg-border px-6 py-4 text-center text-text-muted text-xs">
        Made by{' '}
        <a href="https://nocodly.com" target="_blank" rel="noopener noreferrer" className="hover:text-text-secondary transition-colors">
          Nocodly
        </a>
        {' '}· '}
        <a href="https://github.com/nocodly/vibemap" target="_blank" rel="noopener noreferrer" className="hover:text-text-secondary transition-colors">
          Star on GitHub ⭐
        </a>
      </footer>
    </div>
  )
}
