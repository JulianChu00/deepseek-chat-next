export interface KnowledgeDoc {
  id: string
  filename: string
  chunks: KnowledgeChunk[]
  createdAt: number
}

export interface KnowledgeChunk {
  id: string
  docId: string
  content: string
  index: number
  embedding: number[]
}

export interface SearchResult {
  chunk: KnowledgeChunk
  score: number
  docFilename: string
}
