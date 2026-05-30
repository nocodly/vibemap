import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Star, GitFork, Clock, LogOut, Map } from 'lucide-react'
import { useAuthStore } from '../../store/authStore.js'
import { useRepoStore } from '../../store/repoStore.js'
import { listRepos } from '../../services/github.js'
import { Loader } from '../ui/Loader.jsx'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export default function RepoSelect() {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const { githubToken, user, logout } = useAuthStore()
  const { setRepo } = useRepoStore()
  const navigate = useNavigate()

  useEffect(() => {
    listRepos(githubToken)
      .then(setRepos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = repos.filter((r) =>
    r.full_name.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  )

  function handleSelect(repo) {
    setRepo(repo)
    navigate(`/repo/${repo.owner.login}/${repo.name}`)
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <header className="border-b border-bg-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <Map size={14} className="text-white" />
          </div>
          <span className="font-semibold text-text-primary">Vibemap</span>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              <img src={user.avatar_url} alt={user.login} className="w-6 h-6 rounded-full" />
              <span className="text-text-secondary text-sm">{user.login}</span>
            </div>
          )}
          <button
            onClick={() => { logout(); navigate('/') }}
            className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-text-secondary transition-colors"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-text-primary mb-1">Select a repository</h1>
          <p className="text-text-secondary text-sm mb-8">
            Choose a repo to explore. You can switch anytime.
          </p>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg-surface border border-bg-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          {/* Repo list */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader />
            </div>
          ) : error ? (
            <p className="text-red-400 text-sm text-center py-8">{error}</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((repo, i) => (
                <motion.button
                  key={repo.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleSelect(repo)}
                  className="w-full text-left p-4 rounded-xl border border-bg-border bg-bg-surface hover:border-accent/40 hover:bg-bg-elevated transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-text-primary text-sm truncate group-hover:text-accent transition-colors">
                          {repo.full_name}
                        </span>
                        {repo.private && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-bg-hover text-text-muted flex-shrink-0">
                            private
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-text-secondary text-xs leading-relaxed line-clamp-1">
                          {repo.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0 text-text-muted text-xs">
                      {repo.language && (
                        <span className="text-text-secondary">{repo.language}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star size={11} />
                        {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {timeAgo(repo.pushed_at)}
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}

              {filtered.length === 0 && (
                <p className="text-text-muted text-sm text-center py-12">
                  No repositories found
                </p>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
