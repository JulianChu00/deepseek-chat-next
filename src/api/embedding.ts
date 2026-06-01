import { pipeline, env } from '@xenova/transformers'

env.allowLocalModels = false
env.useBrowserCache = true

let embedPipeline: any = null

async function getPipeline() {
  if (!embedPipeline) {
    embedPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
  }
  return embedPipeline
}

export async function batchEmbed(texts: string[]): Promise<number[][]> {
  const pipe = await getPipeline()
  const results: number[][] = []

  for (const text of texts) {
    const output = await pipe(text, { pooling: 'mean', normalize: true })
    if (!output || !output.data) {
      throw new Error('Embedding model returned empty result')
    }
    results.push(Array.from(output.data))
  }

  return results
}

export async function singleEmbed(text: string): Promise<number[]> {
  const results = await batchEmbed([text])
  return results[0]
}
