import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Map, RefreshCw } from 'lucide-react'
import { useRepoStore } from '../../store/repoStore.js'
import { useAIStore } from '../../store/aiStore.js'
import { streamChat } from '../../ai/index.js'
import { buildSemanticMapPrompt } from '../../prompts/systemPrompt.js'
import { Loader } from '../ui/Loader.jsx'
import BlockCard from './BlockCard.jsx'

// Convert nested file tree to flat FULL paths — critical for AI to return correct paths
function getAllFilePaths(node) {
  if (!node?.children) return []
  const paths = []
  for (const child of Object.values(node.children)) {
    if (child.type === 'dir') {
      paths.push(...getAllFilePaths(child))
    } else if (child.path) {
      paths.push(child.path)
    }
  }
  return paths
}

// Also keep indented version for display context
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


export default function SemanticMap() {
  const { selectedRepo, fileTree, semanticMap, setSemanticMap, loadingMap, setLoading } = useRepoStore()
  const { provider, apiKey, model, isConfigured } = useAIStore()
  const [error, setError] = useState(null)
  const [streaming, setStreaming] = useState(false)
  const [rawStream, setRawStream] = useState('')
  const [rawResult, setRawResult] = useState('')

  async function generateMap() {
    if (!isConfigured() || !fileTree) return

    setLoading('loadingMap', true)
    setStreaming(true)
    setRawStream('')
    setRawResult('')
    setError(null)

    // Use flat full paths so AI returns correct paths
    const flatPaths = getAllFilePaths(fileTree).join('\n')

    try {
      const result = await streamChat({
        provider,
        apiKey,
        model,
        messages: [{
          role: 'user',
          content: buildSemanticMapPrompt(flatPaths, selectedRepo?.full_name),
        }],
        onChunk: (_, full) => setRawStream(full),
      })
      setRawResult(result)

      // Reliable JSON extractor — counts brackets instead of regex
      function extractJsonObject(str) {
        const start = str.indexOf('{')
        if (start === -1) return null
        let depth = 0
        for (let i = start; i < str.length; i++) {
          if (str[i] === '{') depth++
          else if (str[i] === '}') {
            depth--
            if (depth === 0) return str.slice(start, i + 1)
          }
        }
        // JSON incomplete — close all open brackets
        const partial = str.slice(start)
        const opens = (partial.match(/\[/g) || []).length
        const closes = (partial.match(/\]/g) || []).length
        const arrFix = ']'.repeat(Math.max(0, opens - closes))
        return partial + arrFix + '}'
      }

      function removeTrailingCommas(str) {
        return str.replace(/,\s*([\]\}])/g, '$1')
      }

      let parsed = null
      const raw = extractJsonObject(result)

      if (raw) {
        for (const attempt of [raw, removeTrailingCommas(raw)]) {
          try {
            const p = JSON.parse(attempt)
            if (p?.blocks?.length) { parsed = p; break }
          } catch {}
        }
      }

      if (!parsed?.blocks) {
        console.error('Raw AI response:', result)
        throw new Error('Could not parse semantic map — try again')
      }
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
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-lg mx-auto">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          {rawResult && (
            <div className="mb-4">
              <p className="text-text-muted text-xs mb-1">Raw AI response (for debugging):</p>
              <pre className="text-[10px] text-text-secondary bg-bg-elevated border border-bg-border rounded-lg p-3 overflow-x-auto max-h-48 leading-relaxed">
                {rawResult.slice(0, 1000)}
              </pre>
            </div>
          )}
          <button
            onClick={generateMap}
            className="flex items-center gap-2 px-4 py-2 bg-bg-elevated border border-bg-border rounded-xl text-text-secondary text-sm hover:text-text-primary transition-colors"
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {semanticMap.blocks.map((block, i) => (
            <motion.div
              key={block.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <BlockCard block={block} />
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
