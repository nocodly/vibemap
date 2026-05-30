import { useRepoStore } from '../../store/repoStore.js'
import { Loader } from '../ui/Loader.jsx'
import FileTree from '../filetree/FileTree.jsx'

export default function Sidebar() {
  const { fileTree, loadingTree } = useRepoStore()

  return (
    <aside className="w-60 flex-shrink-0 border-r border-bg-border bg-bg-surface flex flex-col overflow-hidden">
      <div className="px-3 py-2.5 border-b border-bg-border flex-shrink-0">
        <span className="text-text-muted text-xs font-medium uppercase tracking-wider">
          Files
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {loadingTree ? (
          <div className="flex justify-center items-center h-20">
            <Loader size={16} />
          </div>
        ) : fileTree ? (
          <FileTree node={fileTree} depth={0} />
        ) : (
          <p className="text-text-muted text-xs text-center py-8 px-4">
            Select a repository to see files
          </p>
        )}
      </div>
    </aside>
  )
}
