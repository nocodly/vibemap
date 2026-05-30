import { useState } from 'react'
import { motion } from 'framer-motion'
import { Key, ExternalLink, Check, ChevronDown } from 'lucide-react'
import { useAIStore, PROVIDERS } from '../../store/aiStore.js'

export default function AISetupModal() {
  const { provider, apiKey, model, setProvider, setApiKey, setModel } = useAIStore()
  const [localKey, setLocalKey] = useState(apiKey || '')
  const [saved, setSaved] = useState(false)

  const providerConfig = provider ? PROVIDERS[provider] : null

  function save() {
    if (!localKey.trim() || !provider || !model) return
    setApiKey(localKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-bg-surface border border-bg-border rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
            <Key size={16} className="text-accent" />
          </div>
          <div>
            <h2 className="text-text-primary font-semibold text-sm">Connect AI</h2>
            <p className="text-text-secondary text-xs">Your key is stored locally, never sent to our servers</p>
          </div>
        </div>

        {/* Provider selection */}
        <div className="mb-4">
          <label className="text-text-secondary text-xs mb-2 block">AI Provider</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(PROVIDERS).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setProvider(key)}
                className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                  provider === key
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-bg-border text-text-secondary hover:border-accent/30 hover:text-text-primary'
                }`}
              >
                {config.name}
              </button>
            ))}
          </div>
        </div>

        {/* Model selection */}
        {providerConfig && (
          <div className="mb-4">
            <label className="text-text-secondary text-xs mb-2 block">Model</label>
            <div className="relative">
              <select
                value={model || ''}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-bg-elevated border border-bg-border rounded-xl px-3 py-2.5 text-sm text-text-primary appearance-none focus:outline-none focus:border-accent/50 pr-8"
              >
                {providerConfig.models.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>
        )}

        {/* API Key input */}
        {providerConfig && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-text-secondary text-xs">API Key</label>
              <a
                href={providerConfig.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent text-xs flex items-center gap-1 hover:underline"
              >
                Get key <ExternalLink size={10} />
              </a>
            </div>
            <input
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder={providerConfig.keyPlaceholder}
              className="w-full bg-bg-elevated border border-bg-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors font-mono"
              onKeyDown={(e) => e.key === 'Enter' && save()}
            />
            <p className="text-text-muted text-xs mt-1.5">
              Stored in localStorage · Never leaves your browser
            </p>
          </div>
        )}

        <button
          onClick={save}
          disabled={!provider || !localKey.trim() || !model}
          className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {saved ? (
            <>
              <Check size={15} />
              Connected!
            </>
          ) : (
            'Start exploring'
          )}
        </button>
      </motion.div>
    </div>
  )
}
