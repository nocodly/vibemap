import { useState, useRef, useEffect } from 'react'
import { Send, MessageSquare, Map, Bug, Plus } from 'lucide-react'
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

const MODES = {
  chat: {
    icon: MessageSquare,
    label: 'Chat',
    placeholder: 'Ask about your code...',
    suggestions: [
      'What is the overall architecture?',
      'How does authentication work?',
      'What are the main entry points?',
      'Where is the database logic?',
    ],
    buildPrompt: (input) => input,
  },
  where: {
    icon: Map,
    label: 'Where?',
    placeholder: 'I want to add...',
    suggestions: [
      'I want to add user notifications',
      'I want to add a dashboard page',
      'I want to add email verification',
      'I want to add an admin panel',
    ],
    buildPrompt: (input) =>
      `I want to add the following feature to this project: "${input}"\n\nBased on the codebase structure, tell me:\n1. Which existing files should I modify and why\n2. Which new files should I create and where\n3. In what order should I make these changes\n\nBe specific with file paths and function names from the actual codebase.`,
  },
  debug: {
    icon: Bug,
    label: 'Debug',
    placeholder: 'Paste your error...',
    suggestions: [
      'TypeError: Cannot read property of undefined',
      'Module not found error',
      '404 Not Found on API call',
      'CORS error on fetch request',
    ],
    buildPrompt: (input) =>
      `I'm getting this error in my project:\n\n\`\`\`\n${input}\n\`\`\`\n\nBased on the codebase:\n1. What is the most likely cause of this error?\n2. Which specific file(s) and line(s) are involved?\n3. What is the exact fix I need to make?\n\nReference actual files and code from this project.`,
  },
}

export default function ChatPanel() {
  const [mode, setMode] = useState('chat')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const { provider, apiKey, model, isConfigured } = useAIStore()
  const { selectedRepo, fileTree, semanticMap, openFile, fileContent } = useRepoStore()

  const currentMode = MODES[mode]

  useEffect(() => {
    setMessages([])
    setInput('')
  }, [mode])

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
    if (inputRef.current) inputRef.current.style.height = '46px'
    const userContent = currentMode.buildPrompt(userMsg)
    const newMessages = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setLoading(true)
    setMessages([...newMessages, { role: 'assistant', content: '' }])

    try {
      const apiMessages = [...messages, { role: 'user', content: userContent }]
      await streamChat({
        provider, apiKey, model,
        system: buildContext(),
        messages: apiMessages,
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

  function autoResize(e) {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }

  if (!isConfigured()) {
    return (
      <aside className="w-full flex-shrink-0 border-l border-[#1e1e1e] bg-[#111] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
            <MessageSquare size={22} className="text-violet-400" />
          </div>
          <p className="text-white/40 text-sm leading-relaxed">
            Add your AI key to chat with your codebase
          </p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-full flex-shrink-0 border-l border-[#1e1e1e] bg-[#111] flex flex-col overflow-hidden">

      {/* Mode tabs */}
      <div className="flex border-b border-[#1e1e1e] flex-shrink-0">
        {Object.entries(MODES).map(([key, m]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-4 text-xs font-semibold transition-colors border-b-2 ${
              mode === key
                ? 'border-violet-500 text-violet-400 bg-violet-500/5'
                : 'border-transparent text-white/35 hover:text-white/60'
            }`}
          >
            <m.icon size={14} />
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <p className="text-white/35 text-xs font-medium px-1 mb-4">
                {mode === 'chat' && 'Ask anything about your codebase:'}
                {mode === 'where' && 'What feature do you want to add?'}
                {mode === 'debug' && "Paste your error and I'll find the cause:"}
              </p>
              {currentMode.suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full text-left px-4 py-3.5 rounded-xl border border-[#262626] hover:border-violet-500/40 hover:bg-violet-500/5 text-white/55 hover:text-white/80 text-sm font-medium transition-all leading-snug"
                >
                  {s}
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div key="messages" className="space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={msg.role === 'user' ? 'flex justify-end' : ''}
                >
                  {msg.role === 'user' ? (
                    <div className="max-w-[88%] bg-violet-500/10 border border-violet-500/20 rounded-xl px-3.5 py-2.5 text-white/85 text-sm leading-relaxed">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="text-white/60 text-sm leading-relaxed prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                      {loading && i === messages.length - 1 && !msg.content && (
                        <span className="inline-block w-1.5 h-4 bg-violet-500 animate-pulse rounded" />
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="flex items-center gap-1.5 text-white/25 hover:text-white/50 text-xs transition-colors mx-auto pt-1"
                >
                  <Plus size={11} className="rotate-45" />
                  New conversation
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#1e1e1e] flex-shrink-0">
        <div className="flex items-end bg-[#161616] border border-[#2a2a2a] rounded-2xl focus-within:border-violet-500/50 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(e) }}
            onKeyDown={handleKeyDown}
            placeholder={currentMode.placeholder}
            rows={1}
            className="flex-1 bg-transparent px-4 py-3 text-sm text-white/80 placeholder:text-white/30 resize-none focus:outline-none leading-relaxed overflow-hidden"
            style={{ minHeight: 46, maxHeight: 140 }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="m-2 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-30 disabled:bg-[#2a2a2a] transition-all"
          >
            {loading ? <Loader size={14} /> : <Send size={14} />}
          </button>
        </div>
      </div>
    </aside>
  )
}
