import { useState, useRef, useEffect } from 'react'
import { Send, MessageSquare, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import { useAIStore } from '../../store/aiStore.js'
import { useRepoStore } from '../../store/repoStore.js'
import { streamChat } from '../../ai/index.js'
import { buildSystemPrompt } from '../../prompts/systemPrompt.js'
import { Loader } from '../ui/Loader.jsx'

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

const SUGGESTIONS = [
  'What is the overall architecture of this project?',
  'How does authentication work here?',
  'What are the main entry points?',
  'Where is the database logic?',
]

export default function ChatPanel() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const { provider, apiKey, model, isConfigured } = useAIStore()
  const { selectedRepo, fileTree, semanticMap, openFile, fileContent } = useRepoStore()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function buildContext() {
    return buildSystemPrompt({
      repo: selectedRepo,
      fileTreeText: treeToText(fileTree),
      semanticMap,
      currentFile: openFile && fileContent
        ? { path: openFile.path, content: fileContent, language: openFile.path.split('.').pop() }
        : null,
    })
  }

  async function send(text) {
    const userMsg = text || input.trim()
    if (!userMsg || loading || !isConfigured()) return

    setInput('')
    const newMessages = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setLoading(true)

    // Add empty assistant message for streaming
    setMessages([...newMessages, { role: 'assistant', content: '' }])

    try {
      await streamChat({
        provider,
        apiKey,
        model,
        system: buildContext(),
        messages: newMessages,
        onChunk: (_, full) => {
          setMessages([...newMessages, { role: 'assistant', content: full }])
        },
      })
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  if (!isConfigured()) {
    return (
      <aside className="w-72 flex-shrink-0 border-l border-bg-border bg-bg-surface flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
            <MessageSquare size={18} className="text-accent" />
          </div>
          <p className="text-text-secondary text-xs leading-relaxed">
            Add your AI key to chat with your codebase
          </p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-72 flex-shrink-0 border-l border-bg-border bg-bg-surface flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-bg-border flex items-center gap-2 flex-shrink-0">
        <Sparkles size={12} className="text-accent" />
        <span className="text-text-secondary text-xs font-medium">Code Assistant</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="space-y-2">
            <p className="text-text-muted text-xs px-1 mb-3">Ask anything about your codebase:</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="w-full text-left px-3 py-2 rounded-lg border border-bg-border hover:border-accent/30 hover:bg-bg-elevated text-text-secondary text-xs transition-colors leading-relaxed"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={msg.role === 'user' ? 'flex justify-end' : ''}
            >
              {msg.role === 'user' ? (
                <div className="max-w-[85%] bg-accent/10 border border-accent/20 rounded-xl px-3 py-2 text-text-primary text-xs">
                  {msg.content}
                </div>
              ) : (
                <div className="text-text-secondary text-xs leading-relaxed prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                  {loading && i === messages.length - 1 && !msg.content && (
                    <span className="inline-block w-1.5 h-3 bg-accent animate-pulse rounded" />
                  )}
                </div>
              )}
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-bg-border flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your code..."
            rows={1}
            className="flex-1 bg-bg-elevated border border-bg-border rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent/50 transition-colors leading-relaxed"
            style={{ minHeight: 36, maxHeight: 100 }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl bg-accent hover:bg-accent-hover text-white disabled:opacity-40 transition-all"
          >
            {loading ? <Loader size={13} /> : <Send size={13} />}
          </button>
        </div>
      </div>
    </aside>
  )
}
