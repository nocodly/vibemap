import { useEffect, useState } from 'react'
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
import MobileNav from './MobileNav.jsx'

export default function AppShell() {
  const { owner, repo } = useParams()
  const navigate = useNavigate()
  const { githubToken } = useAuthStore()
  const { selectedRepo, setFileTree, setLoading } = useRepoStore()
  const { isConfigured } = useAIStore()

  // Mobile active panel: 'files' | 'map' | 'chat'
  const [mobilePanel, setMobilePanel] = useState('map')

  useEffect(() => {
    if (!selectedRepo) navigate('/repos', { replace: true })
  }, [selectedRepo])

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
    <div className="h-screen bg-[#0d0d0d] flex flex-col overflow-hidden">
      <Header />

      {/* Desktop layout: 3 panels */}
      <div className="flex-1 flex overflow-hidden md:flex">

        {/* Sidebar — hidden on mobile unless mobilePanel=files */}
        <div className={`
          md:flex md:w-64 md:flex-shrink-0
          ${mobilePanel === 'files' ? 'flex flex-1' : 'hidden md:flex'}
        `}>
          <Sidebar />
        </div>

        {/* Main panel — hidden on mobile unless mobilePanel=map */}
        <div className={`
          flex-1 overflow-hidden min-w-0
          ${mobilePanel === 'map' ? 'flex flex-col' : 'hidden md:flex md:flex-col'}
        `}>
          <MainPanel />
        </div>

        {/* Chat panel — hidden on mobile unless mobilePanel=chat */}
        <div className={`
          md:flex md:w-80 md:flex-shrink-0
          ${mobilePanel === 'chat' ? 'flex flex-1' : 'hidden md:flex'}
        `}>
          <ChatPanel />
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav active={mobilePanel} onChange={setMobilePanel} />

      {!isConfigured() && <AISetupModal />}
    </div>
  )
}
