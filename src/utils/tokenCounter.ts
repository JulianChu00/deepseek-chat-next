export function estimateTokens(text: string): number {
  if (!text) return 0
  let tokens = 0
  for (const char of text) {
    const code = char.charCodeAt(0)
    if (code >= 0x4e00 && code <= 0x9fff) {
      tokens += 1
    } else if (char === ' ' || char === '\n' || char === '\t') {
      tokens += 0.25
    } else {
      tokens += 0.3
    }
  }
  return Math.round(tokens)
}

export function countSessionTokens(messages: { content: string; reasoningContent?: string }[]): number {
  let total = 0
  for (const m of messages) {
    total += estimateTokens(m.content)
    if (m.reasoningContent) total += estimateTokens(m.reasoningContent)
  }
  return total
}
