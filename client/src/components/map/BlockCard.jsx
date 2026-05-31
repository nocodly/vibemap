import { useRepoStore } from '../../store/repoStore.js'
import { useAuthStore } from '../../store/authStore.js'
import { getFileContent } from '../../services/github.js'
import FileIcon from '../filetree/FileIcon.jsx'

const COLOR_STYLES = {
  auth:    { border: '#f97316', bg: 'rgba(249,115,22,0.06)',  badge: 'bg-orange-500/10 text-orange-400',  dot: 'bg-orange-400' },
  db:      { border: '#3b82f6', bg: 'rgba(59,130,246,0.06)', badge: 'bg-blue-500/10 text-blue-400',      dot: 'bg-blue-400' },
  api:     { border: '#10b981', bg: 'rgba(16,185,129,0.06)', badge: 'bg-emerald-500/10 text-emerald-400', dot: 'bg-emerald-400' },
  ui:      { border: '#a855f7', bg: 'rgba(168,85,247,0.06)', badge: 'bg-purple-500/10 text-purple-400',  dot: 'bg-purple-400' },
  config:  { border: '#f59e0b', bg: 'rgba(245,158,11,0.06)', badge: 'bg-yellow-500/10 text-yellow-400',  dot: 'bg-yellow-400' },
  util:    { border: '#6b7280', bg: 'rgba(107,114,128,0.06)',badge: 'bg-gray-500/10 text-gray-400',      dot: 'bg-gray-400' },
  payment: { border: '#ec4899', bg: 'rgba(236,72,153,0.06)', badge: 'bg-pink-500/10 text-pink-400',      dot: 'bg-pink-400' },
  test:    { border: '#84cc16', bg: 'rgba(132,204,22,0.06)', badge: 'bg-lime-500/10 text-lime-400',      dot: 'bg-lime-400' },
}

export default function BlockCard({ block }) {
  const { setOpenFile, setFileContent, setLoading, selectedRepo } = useRepoStore()
  const { githubToken } = useAuthStore()

  const style = COLOR_STYLES[block.color] || COLOR_STYLES.util

  async function openFile(path) {
    const name = path.split('/').pop()
    setOpenFile({ path, name })
    setLoading('loadingFile', true)
    try {
      const content = await getFileContent(githubToken, selectedRepo.owner.login, selectedRepo.name, path)
      setFileContent(content)
    } catch {
      setFileContent('// Could not load file')
    } finally {
      setLoading('loadingFile', false)
    }
  }

  return (
    <div
      className="rounded-xl border border-bg-border overflow-hidden transition-all duration-200 hover:border-opacity-60 hover:shadow-lg hover:shadow-black/20 group"
      style={{ borderLeftWidth: 3, borderLeftColor: style.border, background: style.bg }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">{block.icon}</span>
            <h3 className="font-semibold text-text-primary text-sm">{block.name}</h3>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${style.badge}`}>
            {block.files?.length || 0} files
          </span>
        </div>
        <p className="text-text-secondary text-xs leading-relaxed">{block.description}</p>
      </div>

      {/* Files */}
      {block.files?.length > 0 && (
        <div className="px-3 pb-3 space-y-0.5">
          <div className="h-px bg-bg-border mb-2" />
          {block.files.slice(0, 5).map((file) => (
            <button
              key={file}
              onClick={() => openFile(file)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left group/file"
            >
              <div className={`w-1 h-1 rounded-full flex-shrink-0 ${style.dot}`} />
              <FileIcon filename={file.split('/').pop()} size={11} />
              <span className="text-text-muted text-xs truncate group-hover/file:text-text-secondary transition-colors font-mono">
                {file}
              </span>
            </button>
          ))}
          {block.files.length > 5 && (
            <p className="text-text-muted text-xs px-2 pt-1">
              +{block.files.length - 5} more
            </p>
          )}
        </div>
      )}
    </div>
  )
}
