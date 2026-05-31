import { Router } from 'express'
import fetch from 'node-fetch'

const router = Router()

// Supported providers and their base URLs
const PROVIDERS = {
  anthropic: 'https://api.anthropic.com/v1/messages',
  openai: 'https://api.openai.com/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
}

// Proxy AI requests — fixes CORS for Anthropic + streams responses
router.post('/chat', async (req, res) => {
  const { provider, model, messages, system } = req.body
  const apiKey = req.headers['x-ai-key']

  if (!apiKey) return res.status(401).json({ error: 'Missing API key' })
  if (!provider || !PROVIDERS[provider]) return res.status(400).json({ error: 'Invalid provider' })
  if (!messages?.length) return res.status(400).json({ error: 'Missing messages' })

  try {
    let requestBody
    let headers = {
      'Content-Type': 'application/json',
    }

    if (provider === 'anthropic') {
      headers['x-api-key'] = apiKey
      headers['anthropic-version'] = '2023-06-01'
      requestBody = {
        model: model || 'claude-sonnet-4-5',
        max_tokens: 4096,
        stream: true,
        system,
        messages,
      }
    } else {
      // OpenAI-compatible (openai + openrouter)
      headers['Authorization'] = `Bearer ${apiKey}`
      if (provider === 'openrouter') {
        headers['HTTP-Referer'] = process.env.CLIENT_URL || 'https://vibemap.nocodly.com'
        headers['X-Title'] = 'Vibemap'
      }
      requestBody = {
        model: model || 'gpt-4o-mini',
        max_tokens: 4096,
        stream: true,
        messages: system
          ? [{ role: 'system', content: system }, ...messages]
          : messages,
      }
    }

    const upstream = await fetch(PROVIDERS[provider], {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    if (!upstream.ok) {
      const err = await upstream.text()
      return res.status(upstream.status).json({ error: err })
    }

    // Stream response back to client
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    upstream.body.pipe(res)

    upstream.body.on('error', (err) => {
      console.error('Stream error:', err)
      res.end()
    })

  } catch (err) {
    console.error('AI proxy error:', err)
    res.status(500).json({ error: 'AI request failed' })
  }
})

export default router
