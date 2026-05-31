import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Map, ArrowLeft, Key, ExternalLink } from 'lucide-react'
import { useAIStore, PROVIDERS } from '../../store/aiStore.js'
import { useRepoStore } from '../../store/repoStore.js'
import { getFileTree, getRepoBranch } from '../../services/github.js'
import Sidebar from '../layout/Sidebar.jsx'
import SemanticMap from '../map/SemanticMap.jsx'
import FileViewer from '../viewer/FileViewer.jsx'
import { Loader } from '../ui/Loader.jsx'

// Fetch public repo without auth token
async function getPublicRepo(owner, repo) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { Accept: 'application/vnd.github+json' }
  })
  if (!res.ok) throw new Error(`Repo not found or private`)
  return res.json()
}

export default function ExploreShell() {
  const { owner, repo } = useParams()
  const navigate = useNavigate()
  const { isConfigured, provider, apiKey, model, setProvider, setApiKey, setModel } = useAIStore()
  const { setRepo, setFileTree, openFile, setLoading, loadingTree } = useRepoStore()

  const [repoData, setRepoData] = useState(null)
  const [error, setError] = useState(null)
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [localKey, setLocalKey] = useState(apiKey || '')
  const [localProvider, setLocalProvider] = useState(provider || 'openai')

  useEffect(() => {
    async function load() {
      setLoading('loadingTree', true)
      try {
        const data = await getPublicRepo(owner, repo)
        setRepoData(data)
        setRepo(data)

        // Fetch tree without auth (public repos)
        const branch = data.default_branch
        const treeRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
          { headers: { Accept: 'application/vnd.github+json' } }
        )
        const treeData = await treeRes.json()

        // Reuse buildTree logic inline
        const SKIP_EXT = new Set(['png','jpg','jpeg','gif','svg','ico','webp','pdf','zip','woff','woff2','ttf','mp4','mp3','lock'])
        const files = treeData.tree.filter(
          (f) => f.type === 'blob' && !SKIP_EXT.has(f.path.split('.').pop()?.toLowerCase())
        )

        const root = buildTree(files)
        setFileTree(root)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading('loadingTree', false)
      }
    }
    load()
  }, [owner, repo])

  function saveAIKey() {
    if (!localKey.trim()) return
    setProvider(localProvider)
    setApiKey(localKey.trim())
    const defaultModel = PROVIDERS[localProvider]?.models[0]?.id
    if (defaultModel) setModel(defaultModel)
    setShowKeyInput(false)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button onClick={() => navigate('/explore')} className="text-violet-400 text-sm hover:underline">
            ← Try another repo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#0d0d0d] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-11 border-b border-[#1e1e1e] bg-[#111] flex items-center px-4 gap-3 flex-shrink-0">
        <button
          onClick={() => navigate('/explore')}
          className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs transition-colors"
        >
          <ArrowLeft size={13} />
          Explore
        </button>

        <div className="w-px h-4 bg-[#2a2a2a]" />

        <div className="flex items-center gap-1.5">
          <Map size={12} className="text-violet-400" />
          <span className="text-white/70 text-xs font-medium">{owner}/{repo}</span>
          {repoData && (
            <a href={repoData.html_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={10} className="text-white/30 hover:text-white/60 transition-colors" />
            </a>
          )}
        </div>

        <div className="flex-1" />

        {/* AI key status */}
        {isConfigured() ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-white/40 text-xs">{PROVIDERS[provider]?.name} · {model?.split('/').pop()}</span>
          </div>
        ) : (
          <button
            onClick={() => setShowKeyInput(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-400 text-xs hover:bg-violet-600/30 transition-colors"
          >
            <Key size={11} />
            Add AI key to see map
          </button>
        )}
      </header>

      {/* AI key prompt */}
      {showKeyInput && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-sm"
          >
            <h3 className="text-white text-sm font-semibold mb-1">Add your AI key</h3>
            <p className="text-white/40 text-xs mb-4">Stored locally, never sent to our servers</p>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {Object.entries(PROVIDERS).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setLocalProvider(k)}
                  className={`px-2 py-1.5 rounded-lg border text-xs transition-all ${
                    localProvider === k
                      ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                      : 'border-[#2a2a2a] text-white/40 hover:border-[#3a3a3a]'
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>

            <input
              autoFocus
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveAIKey()}
              placeholder={PROVIDERS[localProvider]?.keyPlaceholder}
              className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-white/20 font-mono mb-3 focus:outline-none focus:border-violet-500/50"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowKeyInput(false)}
                className="flex-1 py-2 rounded-xl border border-[#2a2a2a] text-white/40 text-xs hover:text-white/60 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveAIKey}
                disabled={!localKey.trim()}
                className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium disabled:opacity-40 transition-colors"
              >
                Start exploring
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-60 flex-shrink-0 border-r border-[#1e1e1e]">
          <Sidebar />
        </div>
        <div className="flex-1 overflow-hidden">
          {loadingTree ? (
            <div className="flex items-center justify-center h-full">
              <Loader />
            </div>
          ) : openFile ? (
            <FileViewer />
          ) : (
            <SemanticMap />
          )}
        </div>
      </div>
    </div>
  )
}

// Build nested tree from flat GitHub tree
function buildTree(flatFiles) {
  const root = { name: '', children: {}, type: 'dir' }
  for (const file of flatFiles) {
    const parts = file.path.split('/')
    let node = root
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      if (!node.children[part]) {
        node.children[part] = isLast
          ? { name: part, path: file.path, type: 'file', sha: file.sha }
          : { name: part, children: {}, type: 'dir' }
      }
      if (!isLast) node = node.children[part]
    }
  }
  return sortTree(root)
}

function sortTree(node) {
  if (node.type === 'file') return node
  const sorted = {}
  const entries = Object.entries(node.children)
  entries.sort(([, a], [, b]) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  for (const [key, child] of entries) sorted[key] = sortTree(child)
  return { ...node, children: sorted }
}
