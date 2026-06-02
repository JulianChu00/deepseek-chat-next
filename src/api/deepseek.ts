import type { ChatMessage, ModelType } from '../types/chat'

export interface StreamCallbacks {
  onReasoning: (text: string) => void
  onContent: (text: string) => void
  onError: (error: Error) => void
  onDone: () => void
}

function getApiKey(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('deepseek_api_key') || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || ''
  }
  return process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || ''
}

export function saveApiKey(key: string) {
  localStorage.setItem('deepseek_api_key', key)
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = 2
): Promise<Response> {
  let lastError: Error | null = null
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, init)
      if (response.ok || response.status < 500) return response
      throw new Error(`HTTP ${response.status}`)
    } catch (err: any) {
      lastError = err
      if (err.name === 'AbortError') throw err
      if (i === retries - 1) throw err
      await new Promise((r) => setTimeout(r, 1000))
    }
  }
  throw lastError
}

export async function streamChat(
  messages: Pick<ChatMessage, 'role' | 'content'>[],
  callbacks: StreamCallbacks,
  model: ModelType,
  signal?: AbortSignal,
  systemPrompt?: string
): Promise<void> {
  const apiKey = getApiKey()

  const response = await fetchWithRetry(
    'https://api.deepseek.com/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt || '你是一个有帮助的助手。' },
          ...messages,
        ],
        ...(model === 'deepseek-reasoner'
          ? {}
          : { thinking: { type: 'enabled' }, reasoning_effort: 'high' }),
        stream: true,
      }),
      signal,
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `HTTP ${response.status}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n\n')
    buffer = lines.pop()!

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const jsonStr = line.slice(6)
      if (jsonStr === '[DONE]') continue

      try {
        const chunk = JSON.parse(jsonStr)
        const delta = chunk.choices?.[0]?.delta
        if (!delta) continue

        if (delta.reasoning_content) {
          callbacks.onReasoning(delta.reasoning_content)
        }
        if (delta.content) {
          callbacks.onContent(delta.content)
        }
      } catch {
        // ignore parse errors for incomplete chunks
      }
    }
  }

  callbacks.onDone()
}
