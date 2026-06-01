/**
 * Split text into overlapping chunks.
 * Chunk size ~500 chars, overlap ~100 chars.
 * Tries to split on paragraph boundaries (double newline), then sentences, then characters.
 */

const CHUNK_SIZE = 500
const OVERLAP = 100

export function splitText(text: string): string[] {
  if (!text || !text.trim()) return []

  // Normalize line endings
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Split on double newlines (paragraphs)
  const paragraphs = normalized.split(/\n\s*\n/).filter((p) => p.trim())

  const chunks: string[] = []
  let currentChunk = ''

  for (const para of paragraphs) {
    // If adding this paragraph exceeds chunk size, push current chunk and start new
    if (currentChunk && (currentChunk.length + para.length) > CHUNK_SIZE) {
      chunks.push(currentChunk.trim())
      // Start new chunk with overlap from previous
      currentChunk = currentChunk.slice(-OVERLAP) + '\n\n' + para
    } else if (para.length > CHUNK_SIZE) {
      // Paragraph is larger than chunk size — split it
      if (currentChunk) {
        chunks.push(currentChunk.trim())
        currentChunk = ''
      }
      // Split long paragraph by sentences
      const subChunks = splitLongText(para)
      chunks.push(...subChunks)
    } else {
      currentChunk = currentChunk ? currentChunk + '\n\n' + para : para
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  // If still empty after all processing, use the raw text as a single chunk
  if (chunks.length === 0 && normalized.trim()) {
    chunks.push(normalized.trim())
  }

  return chunks
}

function splitLongText(text: string): string[] {
  // Split on sentence boundaries (Chinese/English punctuation)
  const sentences = text.match(
    /[^。！？\.!\?\n]+[。！？\.!\?]?/g
  ) || [text]

  const chunks: string[] = []
  let current = ''

  for (const sentence of sentences) {
    if (current && (current.length + sentence.length) > CHUNK_SIZE) {
      chunks.push(current.trim())
      current = current.slice(-OVERLAP) + sentence
    } else {
      current += sentence
    }
  }

  if (current.trim()) {
    chunks.push(current.trim())
  }

  return chunks
}
