import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRepoStore } from '../../store/repoStore.js'
import { useAuthStore } from '../../store/authStore.js'
import { getFileContent } from '../../services/github.js'
import FileIcon from '../filetree/FileIcon.jsx'

const COLOR_MAP = {
  auth:    { pill: 'bg-orange-500/15 text-orange-300 border-orange-500/20', dot: '#f97316', glow: 'group-hover:border-orange-500/30' },
  db:      { pill: 'bg-blue-500/15 text-blue-300 border-blue-500/20',       dot: '#3b82f6', glow: 'group-hover:border-blue-500/30' },
  api:     { pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20', dot: '#10b981', glow: 'group-hover:border-emerald-500/30' },
  ui:      { pill: 'bg-violet-500/15 text-violet-300 border-violet-500/20', dot: '#8b5cf6', glow: 'group-hover:border-violet-500/30' },
  config:  { pill: 'bg-amber-500/15 text-amber-300 border-amber-500/20',    dot: '#f59e0b', glow: 'group-hover:border-amber-500/30' },
  util:    { pill: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',       dot: '#71717a', glow: 'group-hover:border-zinc-500/30' },
  payment: { pill: 'bg-pink-500/15 text-pink-300 border-pink-500/20',       dot: '#ec4899', glow: 'group-hover:border-pink-500/30' },
  test:    { pill: 'bg-lime-500/15 text-lime-300 border-lime-500/20',       dot: '#84cc16', glow: 'group-hover:border-lime-500/30' },
}

export default function BlockCard({ block }) {
  const [open, setOpen] = useState(false)
  const { setOpenFile, setFileContent, setLoading, selectedRepo } = useRepoStore()
  const { githubToken } = useAuthStore()
  const c = COLOR_MAP[block.color] || COLOR_MAP.util
  const fileCount = block.files?.length || 0

  async function openFile(e, path) {
    e.stopPropagation()
    const name = path.split('/').pop()
    setOpenFile({ path, name })
    setLoading('loadingFile', true)
    try {
      const content = await getFileContent(
        githubToken,
        selectedRepo.owner.login,
        selectedRepo.name,
        path
      )
      setFileContent(content)
    } catch {
      setFileContent('// Could not load file')
    } finally {
      setLoading('loadingFile', false)
    }
  }

  return (
    <div className={`group rounded-xl border border-[#252525] bg-[#141414] overflow-hidden transition-all duration-200 ${c.glow} ${open ? 'border-[#303030]' : 'hover:border-[#2e2e2e]'}`}>

      {/* Header row — always visible, click to expand */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left hover:bg-white/[0.02] transition-colors"
      >
        {/* Color dot */}
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0 opacity-80"
          style={{ backgroundColor: c.dot }}
        />

        {/* Icon + Name */}
        <span className="text-base leading-none flex-shrink-0">{block.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white/90 tracking-tight">{block.name}</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${c.pill}`}>
              {block.color}
            </span>
          </div>
          <p className="text-xs text-white/35 mt-0.5 truncate leading-relaxed">{block.description}</p>
        </div>

        {/* File count + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-white/30 font-medium tabular-nums">
            {fileCount} {fileCount === 1 ? 'file' : 'files'}
          </span>
          <ChevronRight
            size={14}
            className={`text-white/25 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

      {/* Expandable file list */}
      <AnimatePresence initial={false}>
        {open && fileCount > 0 && (
          <motion.div
            key="files"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#222] px-2 py-2">
              {block.files.map((file) => {
                const filename = file.split('/').pop()
                return (
                  <button
                    key={file}
                    onClick={(e) => openFile(e, file)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.05] transition-colors text-left group/file"
                  >
                    <FileIcon filename={filename} size={13} />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-white/55 group-hover/file:text-white/85 transition-colors truncate block">
                        {filename}
                      </span>
                      <span className="text-[10px] text-white/20 font-mono truncate block">
                        {file.includes('/') ? file.substring(0, file.lastIndexOf('/')) : ''}
                      </span>
                    </div>
                    <ChevronRight size={11} className="text-white/15 group-hover/file:text-white/40 flex-shrink-0 transition-colors" />
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
