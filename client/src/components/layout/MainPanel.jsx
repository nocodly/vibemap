import { useRepoStore } from '../../store/repoStore.js'
import SemanticMap from '../map/SemanticMap.jsx'
import FileViewer from '../viewer/FileViewer.jsx'

export default function MainPanel() {
  const { openFile } = useRepoStore()

  return (
    <main className="flex-1 overflow-hidden flex flex-col min-w-0">
      {openFile ? <FileViewer /> : <SemanticMap />}
    </main>
  )
}
