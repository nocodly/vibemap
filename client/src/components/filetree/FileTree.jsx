import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react'
import { useRepoStore } from '../../store/repoStore.js'
import { useAuthStore } from '../../store/authStore.js'
import { getFileContent } from '../../services/github.js'
import FileIcon from './FileIcon.jsx'

export default function FileTree({ node, depth = 0 }) {
  if (!node || !node.children) return null

  return (
    <div>
      {Object.values(node.children).map((child) =>
        child.type === 'dir' ? (
          <DirNode key={child.name} node={child} depth={depth} />
        ) : (
          <FileNode key={child.path} node={child} depth={depth} />
        )
      )}
    </div>
  )
}

function DirNode({ node, depth }) {
  const [open, setOpen] = useState(depth === 0)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1 px-2 py-0.5 hover:bg-bg-hover text-text-secondary hover:text-text-primary text-xs transition-colors rounded"
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        <span className="text-text-muted w-3 flex-shrink-0">
          {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        </span>
        {open ? (
          <FolderOpen size={13} className="text-yellow-500/70 flex-shrink-0" />
        ) : (
          <Folder size={13} className="text-yellow-500/70 flex-shrink-0" />
        )}
        <span className="truncate ml-1">{node.name}</span>
      </button>

      {open && (
        <div>
          {Object.values(node.children).map((child) =>
            child.type === 'dir' ? (
              <DirNode key={child.name} node={child} depth={depth + 1} />
            ) : (
              <FileNode key={child.path} node={child} depth={depth + 1} />
            )
          )}
        </div>
      )}
    </div>
  )
}

function FileNode({ node, depth }) {
  const { openFile, setOpenFile, setFileContent, setLoading, selectedRepo } = useRepoStore()
  const { githubToken } = useAuthStore()
  const isActive = openFile?.path === node.path

  async function handleClick() {
    if (isActive) return
    setOpenFile(node)

    try {
      setLoading('loadingFile', true)
      const content = await getFileContent(
        githubToken,
        selectedRepo.owner.login,
        selectedRepo.name,
        node.path
      )
      setFileContent(content)
    } catch (err) {
      setFileContent('// Error loading file: ' + err.message)
    } finally {
      setLoading('loadingFile', false)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-1.5 px-2 py-0.5 text-xs transition-colors rounded ${
        isActive
          ? 'bg-accent/15 text-accent'
          : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
      }`}
      style={{ paddingLeft: `${20 + depth * 12}px` }}
    >
      <FileIcon filename={node.name} size={12} />
      <span className="truncate">{node.name}</span>
    </button>
  )
}
