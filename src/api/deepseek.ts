import type { ChatMessage, StreamCallbacks } from '../types/chat'

const DEFAULT_API_KEY = 'sk-2a2484d9a11749439160d4df53e69b2e'

function getApiKey(): string {
  if (typeof window === 'undefined') return DEFAULT_API_KEY
  return localStorage.getItem('deepseek_api_key') || DEFAULT_API_KEY
}

export function saveApiKey(key: string) {
  localStorage.setItem('deepseek_api_key', key)
}

export async function streamChat(
  messages: Pick<ChatMessage, 'role' | 'content'>[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const apiKey = getApiKey()

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-v4-pro',
      messages: [
        { role: 'system', content: '你是一个有帮助的助手。' },
        ...messages,
      ],
      thinking: { type: 'enabled' },
      reasoning_effort: 'high',
      stream: true,
    }),
    signal,
  })

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
