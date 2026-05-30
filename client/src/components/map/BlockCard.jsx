import { useRepoStore } from '../../store/repoStore.js'
import { useAuthStore } from '../../store/authStore.js'
import { getFileContent } from '../../services/github.js'
import FileIcon from '../filetree/FileIcon.jsx'

export default function BlockCard({ block, colorClass }) {
  const { setOpenFile, setFileContent, setLoading, selectedRepo } = useRepoStore()
  const { githubToken } = useAuthStore()

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
    <div className={`rounded-xl border p-4 ${colorClass} transition-all`}>
      {/* Block header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{block.icon}</span>
        <h3 className="font-semibold text-text-primary text-sm">{block.name}</h3>
        <span className="ml-auto text-text-muted text-xs">{block.files?.length || 0} files</span>
      </div>

      <p className="text-text-secondary text-xs leading-relaxed mb-3">{block.description}</p>

      {/* Files list */}
      {block.files?.length > 0 && (
        <div className="space-y-0.5">
          {block.files.slice(0, 6).map((file) => (
            <button
              key={file}
              onClick={() => openFile(file)}
              className="w-full flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors text-left group"
            >
              <FileIcon filename={file.split('/').pop()} size={11} />
              <span className="text-text-muted text-xs truncate group-hover:text-text-secondary transition-colors">
                {file}
              </span>
            </button>
          ))}
          {block.files.length > 6 && (
            <p className="text-text-muted text-xs px-2 pt-0.5">
              +{block.files.length - 6} more files
            </p>
          )}
        </div>
      )}
    </div>
  )
}
