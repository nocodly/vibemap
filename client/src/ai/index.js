// Unified AI client — proxies through our server to fix CORS
// The API key is sent in x-ai-key header, never stored server-side

const SERVER = import.meta.env.VITE_SERVER_URL || ''

export async function streamChat({ provider, apiKey, model, system, messages, onChunk, onDone }) {
  const res = await fetch(`${SERVER}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-ai-key': apiKey,
    },
    body: JSON.stringify({ provider, model, system, messages }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `AI request failed: ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split('\n').filter(Boolean)

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') continue

      try {
        const json = JSON.parse(data)
        let text = ''

        // Anthropic format
        if (json.type === 'content_block_delta') {
          text = json.delta?.text || ''
        }
        // OpenAI / OpenRouter format
        else if (json.choices?.[0]?.delta?.content != null) {
          text = json.choices[0].delta.content
        }

        if (text) {
          fullText += text
          onChunk?.(text, fullText)
        }
      } catch {
        // skip malformed SSE lines
      }
    }
  }

  onDone?.(fullText)
  return fullText
}

// Single non-streaming request — for analysis tasks
export async function chat({ provider, apiKey, model, system, messages }) {
  let result = ''

  await streamChat({
    provider, apiKey, model, system, messages,
    onChunk: (chunk) => { result += chunk },
  })

  return result
}
