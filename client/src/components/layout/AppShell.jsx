import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore.js'
import { useRepoStore } from '../../store/repoStore.js'
import { useAIStore } from '../../store/aiStore.js'
import { getFileTree, getRepoBranch } from '../../services/github.js'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'
import MainPanel from './MainPanel.jsx'
import ChatPanel from './ChatPanel.jsx'
import AISetupModal from '../onboarding/AISetupModal.jsx'

export default function AppShell() {
  const { owner, repo } = useParams()
  const navigate = useNavigate()
  const { githubToken } = useAuthStore()
  const { selectedRepo, setRepo, setFileTree, setLoading } = useRepoStore()
  const { isConfigured } = useAIStore()

  // If repo isn't set in store (direct URL access), go to repo select
  useEffect(() => {
    if (!selectedRepo) {
      navigate('/repos', { replace: true })
    }
  }, [selectedRepo])

  // Load file tree when repo is selected
  useEffect(() => {
    if (!selectedRepo || !githubToken) return

    async function loadTree() {
      setLoading('loadingTree', true)
      try {
        const branch = await getRepoBranch(githubToken, owner, repo)
        const tree = await getFileTree(githubToken, owner, repo, branch)
        setFileTree(tree)
      } catch (err) {
        console.error('Failed to load file tree:', err)
      } finally {
        setLoading('loadingTree', false)
      }
    }

    loadTree()
  }, [selectedRepo, githubToken])

  return (
    <div className="h-screen bg-bg-base flex flex-col overflow-hidden">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Left: File tree */}
        <Sidebar />

        {/* Center: Map or file viewer */}
        <MainPanel />

        {/* Right: AI chat */}
        <ChatPanel />
      </div>

      {/* AI setup modal — shows if AI not configured */}
      {!isConfigured() && <AISetupModal />}
    </div>
  )
}
