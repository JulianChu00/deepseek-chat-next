function getApiKey(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('deepseek_api_key') || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || ''
  }
  return process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || ''
}

/**
 * Generate embeddings for a batch of texts using DeepSeek Embedding API
 */
export async function batchEmbed(texts: string[]): Promise<number[][]> {
  const apiKey = getApiKey()

  const response = await fetch('https://api.deepseek.com/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      input: texts,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `Embedding HTTP ${response.status}`)
  }

  const data = await response.json()
  return data.data
    .sort((a: any, b: any) => a.index - b.index)
    .map((item: any) => item.embedding)
}

/**
 * Generate a single embedding
 */
export async function singleEmbed(text: string): Promise<number[]> {
  const results = await batchEmbed([text])
  return results[0]
}
