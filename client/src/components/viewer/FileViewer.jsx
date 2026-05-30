import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Sparkles, Copy, Check } from 'lucide-react'
import { useRepoStore } from '../../store/repoStore.js'
import { useAIStore } from '../../store/aiStore.js'
import { streamChat } from '../../ai/index.js'
import { buildFileAnalysisPrompt } from '../../prompts/systemPrompt.js'
import { Loader } from '../ui/Loader.jsx'
import FileIcon from '../filetree/FileIcon.jsx'
import ReactMarkdown from 'react-markdown'

function getLanguage(path) {
  const ext = path?.split('.').pop()?.toLowerCase()
  const map = {
    js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
    py: 'python', go: 'go', rs: 'rust', rb: 'ruby',
    css: 'css', scss: 'scss', html: 'html',
    json: 'json', yaml: 'yaml', yml: 'yaml', md: 'markdown',
    sh: 'bash', bash: 'bash',
  }
  return map[ext] || 'text'
}

export default function FileViewer() {
  const { openFile, fileContent, loadingFile, setOpenFile } = useRepoStore()
  const { provider, apiKey, model, isConfigured } = useAIStore()

  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [copied, setCopied] = useState(false)

  // Reset analysis when file changes
  useEffect(() => {
    setAnalysis(null)
  }, [openFile?.path])

  async function analyzeFile() {
    if (!isConfigured() || !fileContent) return
    setAnalyzing(true)
    setAnalysis('')

    try {
      await streamChat({
        provider,
        apiKey,
        model,
        messages: [{ role: 'user', content: buildFileAnalysisPrompt(openFile.path, fileContent) }],
        onChunk: (_, full) => setAnalysis(full),
      })
    } catch (err) {
      setAnalysis('Error: ' + err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  async function copyCode() {
    await navigator.clipboard.writeText(fileContent || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!openFile) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col overflow-hidden"
    >
      {/* File header */}
      <div className="h-9 border-b border-bg-border bg-bg-surface flex items-center px-4 gap-3 flex-shrink-0">
        <FileIcon filename={openFile.name} size={13} />
        <span className="text-text-primary text-xs font-medium truncate flex-1">{openFile.path}</span>

        <div className="flex items-center gap-2">
          {isConfigured() && !analysis && (
            <button
              onClick={analyzeFile}
              disabled={analyzing || loadingFile}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent text-xs font-medium transition-colors disabled:opacity-50"
            >
              <Sparkles size={11} />
              {analyzing ? 'Analyzing...' : 'Explain this file'}
            </button>
          )}

          <button
            onClick={copyCode}
            className="p-1.5 rounded hover:bg-bg-elevated text-text-muted hover:text-text-secondary transition-colors"
            title="Copy code"
          >
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
          </button>

          <button
            onClick={() => setOpenFile(null)}
            className="p-1.5 rounded hover:bg-bg-elevated text-text-muted hover:text-text-secondary transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loadingFile ? (
          <div className="flex justify-center items-center h-32">
            <Loader />
          </div>
        ) : (
          <div className="flex flex-col">
            {/* AI Analysis */}
            {(analysis || analyzing) && (
              <div className="mx-4 mt-4 p-4 rounded-xl border border-accent/20 bg-accent/5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={13} className="text-accent" />
                  <span className="text-accent text-xs font-medium">AI Analysis</span>
                  {analyzing && <Loader size={12} />}
                </div>
                <div className="prose prose-sm prose-invert max-w-none text-text-secondary text-xs leading-relaxed">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Code */}
            <pre className="p-4 text-xs font-mono text-text-primary leading-relaxed overflow-x-auto">
              <code>{fileContent}</code>
            </pre>
          </div>
        )}
      </div>
    </motion.div>
  )
}
