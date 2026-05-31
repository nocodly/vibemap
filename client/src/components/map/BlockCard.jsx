import { useRepoStore } from '../../store/repoStore.js'
import { useAuthStore } from '../../store/authStore.js'
import { getFileContent } from '../../services/github.js'
import FileIcon from '../filetree/FileIcon.jsx'

const COLOR_MAP = {
  auth:    { pill: 'bg-orange-500/15 text-orange-300 border-orange-500/20', dot: '#f97316' },
  db:      { pill: 'bg-blue-500/15 text-blue-300 border-blue-500/20',       dot: '#3b82f6' },
  api:     { pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20', dot: '#10b981' },
  ui:      { pill: 'bg-violet-500/15 text-violet-300 border-violet-500/20', dot: '#8b5cf6' },
  config:  { pill: 'bg-amber-500/15 text-amber-300 border-amber-500/20',    dot: '#f59e0b' },
  util:    { pill: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',       dot: '#71717a' },
  payment: { pill: 'bg-pink-500/15 text-pink-300 border-pink-500/20',       dot: '#ec4899' },
  test:    { pill: 'bg-lime-500/15 text-lime-300 border-lime-500/20',       dot: '#84cc16' },
}

export default function BlockCard({ block }) {
  const { setOpenFile, setFileContent, setLoading, selectedRepo } = useRepoStore()
  const { githubToken } = useAuthStore()
  const c = COLOR_MAP[block.color] || COLOR_MAP.util

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
    <div className="rounded-xl border border-[#252525] bg-[#141414] hover:border-[#333] hover:bg-[#161616] transition-all duration-200 hover:shadow-xl hover:shadow-black/30 overflow-hidden">

      {/* Card header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-base leading-none">{block.icon}</span>
            <span className="text-[13px] font-semibold text-white/90 tracking-tight">{block.name}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${c.pill}`}>
              {block.color}
            </span>
            <span className="text-[11px] text-white/30 font-mono">{block.files?.length || 0}</span>
          </div>
        </div>
        <p className="text-[12px] text-white/40 leading-relaxed">{block.description}</p>
      </div>

      {/* Divider */}
      {block.files?.length > 0 && <div className="h-px bg-[#222]" />}

      {/* Files */}
      {block.files?.length > 0 && (
        <div className="p-2">
          {block.files.slice(0, 5).map((file) => (
            <button
              key={file}
              onClick={() => openFile(file)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors text-left group"
            >
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-70"
                style={{ backgroundColor: c.dot }}
              />
              <FileIcon filename={file.split('/').pop()} size={11} />
              <span className="text-[11px] text-white/35 font-mono truncate group-hover:text-white/60 transition-colors">
                {file}
              </span>
            </button>
          ))}
          {block.files.length > 5 && (
            <p className="text-[10px] text-white/20 px-2 pt-1 font-mono">
              +{block.files.length - 5} more files
            </p>
          )}
        </div>
      )}
    </div>
  )
}
