import { useNavigate } from 'react-router-dom'
import { Map, ChevronRight, Settings, LogOut, ExternalLink } from 'lucide-react'
import { useAuthStore } from '../../store/authStore.js'
import { useRepoStore } from '../../store/repoStore.js'
import { useAIStore } from '../../store/aiStore.js'
import { PROVIDERS } from '../../store/aiStore.js'

export default function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { selectedRepo } = useRepoStore()
  const { provider, model, isConfigured } = useAIStore()

  const providerName = provider ? PROVIDERS[provider]?.name : null
  const modelLabel = provider && model
    ? PROVIDERS[provider]?.models.find((m) => m.id === model)?.label || model
    : null

  return (
    <header className="h-11 border-b border-bg-border bg-bg-surface flex items-center px-4 gap-4 flex-shrink-0">
      {/* Logo + breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={() => navigate('/repos')}
          className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
        >
          <div className="w-5 h-5 rounded bg-accent flex items-center justify-center">
            <Map size={11} className="text-white" />
          </div>
          <span className="text-text-secondary text-xs">Vibemap</span>
        </button>

        {selectedRepo && (
          <>
            <ChevronRight size={12} className="text-text-muted flex-shrink-0" />
            <a
              href={selectedRepo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-primary text-xs font-medium hover:text-accent transition-colors flex items-center gap-1 truncate"
            >
              {selectedRepo.full_name}
              <ExternalLink size={10} className="text-text-muted flex-shrink-0" />
            </a>
          </>
        )}
      </div>

      <div className="flex-1" />

      {/* AI status */}
      {isConfigured() && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-elevated border border-bg-border">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-text-secondary text-xs">{providerName} · {modelLabel}</span>
        </div>
      )}

      {/* User avatar */}
      {user && (
        <div className="flex items-center gap-2">
          <img src={user.avatar_url} alt={user.login} className="w-5 h-5 rounded-full" />
          <button
            onClick={() => { logout(); navigate('/') }}
            className="p-1 rounded hover:bg-bg-elevated text-text-muted hover:text-text-secondary transition-colors"
            title="Logout"
          >
            <LogOut size={12} />
          </button>
        </div>
      )}
    </header>
  )
}
