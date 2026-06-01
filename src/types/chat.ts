export type ModelType = 'deepseek-chat' | 'deepseek-reasoner' | 'deepseek-v4-pro'

export const MODEL_OPTIONS: { value: ModelType; label: string }[] = [
  { value: 'deepseek-v4-pro', label: 'DeepSeek V4 Pro' },
  { value: 'deepseek-chat', label: 'DeepSeek V3' },
  { value: 'deepseek-reasoner', label: 'DeepSeek R1' },
]

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
