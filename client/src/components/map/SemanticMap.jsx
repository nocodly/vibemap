import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Map, RefreshCw } from 'lucide-react'
import { useRepoStore } from '../../store/repoStore.js'
import { useAIStore } from '../../store/aiStore.js'
import { streamChat } from '../../ai/index.js'
import { buildSemanticMapPrompt } from '../../prompts/systemPrompt.js'
import { Loader } from '../ui/Loader.jsx'
import BlockCard from './BlockCard.jsx'

// Convert nested file tree to flat text representation
function treeToText(node, prefix = '') {
  if (!node?.children) return ''
  let result = ''
  for (const child of Object.values(node.children)) {
    if (child.type === 'dir') {
      result += `${prefix}${child.name}/\n`
      result += treeToText(child, prefix + '  ')
    } else {
      result += `${prefix}${child.name}\n`
    }
  }
  return result
}

const BLOCK_COLORS = {
  auth: 'border-orange-500/30 bg-orange-500/5',
  db: 'border-blue-500/30 bg-blue-500/5',
  api: 'border-emerald-500/30 bg-emerald-500/5',
  ui: 'border-purple-500/30 bg-purple-500/5',
  config: 'border-yellow-500/30 bg-yellow-500/5',
  util: 'border-gray-500/30 bg-gray-500/5',
  payment: 'border-pink-500/30 bg-pink-500/5',
  test: 'border-lime-500/30 bg-lime-500/5',
}

export default function SemanticMap() {
  const { selectedRepo, fileTree, semanticMap, setSemanticMap, loadingMap, setLoading } = useRepoStore()
  const { provider, apiKey, model, isConfigured } = useAIStore()
  const [error, setError] = useState(null)
  const [streaming, setStreaming] = useState(false)
  const [rawStream, setRawStream] = useState('')

  async function generateMap() {
    if (!isConfigured() || !fileTree) return

    setLoading('loadingMap', true)
    setStreaming(true)
    setRawStream('')
    setError(null)

    const treeText = treeToText(fileTree)

    try {
      const result = await streamChat({
        provider,
        apiKey,
        model,
        messages: [{
          role: 'user',
          content: buildSemanticMapPrompt(treeText, selectedRepo?.full_name),
        }],
        onChunk: (_, full) => setRawStream(full),
      })

      // Parse JSON — handle markdown code blocks and malformed JSON
      let parsed = null
      const attempts = [
        // 1. JSON inside ```json ... ```
        result.match(/```json\s*([\s\S]*?)\s*```/)?.[1],
        // 2. JSON inside ``` ... ```
        result.match(/```\s*([\s\S]*?)\s*```/)?.[1],
        // 3. Raw JSON object
        result.match(/\{[\s\S]*\}/)?.[0],
      ]

      for (const attempt of attempts) {
        if (!attempt) continue
        try {
          parsed = JSON.parse(attempt)
          break
        } catch {
          // try next
        }
      }

      if (!parsed?.blocks) throw new Error('Could not parse semantic map — try again')
      setSemanticMap(parsed)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading('loadingMap', false)
      setStreaming(false)
    }
  }

  // Auto-generate when AI is configured and tree is loaded
  useEffect(() => {
    if (isConfigured() && fileTree && !semanticMap && !loadingMap) {
      generateMap()
    }
  }, [isConfigured(), fileTree])

  // Not configured yet — prompt user
  if (!isConfigured()) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Map size={22} className="text-accent" />
          </div>
          <h2 className="text-text-primary font-semibold mb-2">Add your AI key</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Connect an AI provider to generate a semantic map of your project.
            You can explore the file tree while setting up.
          </p>
        </div>
      </div>
    )
  }

  // Loading / streaming
  if (loadingMap || streaming) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Loader size={24} />
          <p className="text-text-secondary text-sm mt-4">
            {streaming ? 'Building semantic map...' : 'Loading...'}
          </p>
          {streaming && rawStream && (
            <p className="text-text-muted text-xs mt-2 max-w-xs">
              Analyzing {rawStream.length} chars...
            </p>
          )}
        </div>
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={generateMap}
            className="flex items-center gap-2 px-4 py-2 bg-bg-elevated border border-bg-border rounded-xl text-text-secondary text-sm hover:text-text-primary transition-colors mx-auto"
          >
            <RefreshCw size={13} />
            Try again
          </button>
        </div>
      </div>
    )
  }

  // Map rendered
  if (semanticMap?.blocks) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-text-primary font-semibold">Project Map</h2>
            <p className="text-text-secondary text-xs mt-0.5">
              {semanticMap.blocks.length} logical blocks · {selectedRepo?.full_name}
            </p>
          </div>
          <button
            onClick={generateMap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated border border-bg-border text-text-secondary text-xs hover:text-text-primary transition-colors"
          >
            <RefreshCw size={11} />
            Regenerate
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {semanticMap.blocks.map((block, i) => (
            <motion.div
              key={block.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <BlockCard block={block} colorClass={BLOCK_COLORS[block.color] || BLOCK_COLORS.util} />
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  // File tree loaded, AI configured, but no map yet
  if (!fileTree) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <button
          onClick={generateMap}
          className="flex items-center gap-2 px-5 py-3 bg-accent text-white rounded-xl font-medium text-sm hover:bg-accent-hover transition-colors mx-auto"
        >
          <Sparkles size={15} />
          Generate Semantic Map
        </button>
      </div>
    </div>
  )
}
