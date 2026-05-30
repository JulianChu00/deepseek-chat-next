export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  reasoningContent?: string
  timestamp: number
  isStreaming?: boolean
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

export interface StreamCallbacks {
  onReasoning: (text: string) => void
  onContent: (text: string) => void
  onError: (error: Error) => void
  onDone: () => void
}
