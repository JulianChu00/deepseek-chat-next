import type { KnowledgeChunk, SearchResult, KnowledgeDoc } from '../types/knowledge'

/**
 * Compute cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0

  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Search across all knowledge documents for chunks most similar to the query embedding.
 * Returns top-k results sorted by similarity score descending.
 */
export function searchChunks(
  queryEmbedding: number[],
  docs: KnowledgeDoc[],
  topK: number = 5,
  minScore: number = 0.3
): SearchResult[] {
  const results: SearchResult[] = []

  for (const doc of docs) {
    for (const chunk of doc.chunks) {
      const score = cosineSimilarity(queryEmbedding, chunk.embedding)
      if (score >= minScore) {
        results.push({ chunk, score, docFilename: doc.filename })
      }
    }
  }

  results.sort((a, b) => b.score - a.score)
  return results.slice(0, topK)
}
