import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const PROVIDERS = {
  anthropic: {
    name: 'Anthropic',
    models: [
      { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },
      { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
      { id: 'claude-opus-4-5', label: 'Claude Opus 4.5' },
    ],
    keyPlaceholder: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { id: 'gpt-4o', label: 'GPT-4o' },
    ],
    keyPlaceholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  openrouter: {
    name: 'OpenRouter',
    models: [
      { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash' },
      { id: 'google/gemini-pro-1.5', label: 'Gemini Pro 1.5' },
      { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B' },
      { id: 'mistralai/mistral-large', label: 'Mistral Large' },
      { id: 'deepseek/deepseek-chat', label: 'DeepSeek Chat' },
    ],
    keyPlaceholder: 'sk-or-...',
    docsUrl: 'https://openrouter.ai/keys',
  },
}

export const useAIStore = create(
  persist(
    (set, get) => ({
      provider: null,    // 'anthropic' | 'openai' | 'openrouter'
      apiKey: null,
      model: null,

      setProvider: (provider) => {
        const defaultModel = PROVIDERS[provider]?.models[0]?.id || null
        set({ provider, model: defaultModel, apiKey: null })
      },

      setApiKey: (key) => set({ apiKey: key }),
      setModel: (model) => set({ model }),

      clearAI: () => set({ provider: null, apiKey: null, model: null }),

      isConfigured: () => {
        const { provider, apiKey, model } = get()
        return !!(provider && apiKey && model)
      },
    }),
    {
      name: 'vibemap-ai',
      partialize: (state) => ({
        provider: state.provider,
        apiKey: state.apiKey,
        model: state.model,
      }),
    }
  )
)
