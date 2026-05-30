'use client'

import { create } from 'zustand'
import type { ChatSession, ChatMessage } from '../types/chat'
import { streamChat, saveApiKey } from '../api/deepseek'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function createEmptySession(): ChatSession {
  const now = Date.now()
  return {
    id: generateId(),
    title: '新对话',
    messages: [],
    createdAt: now,
    updatedAt: now,
  }
}

interface ChatState {
  sessions: ChatSession[]
  activeSessionId: string
  apiKey: string
  isStreaming: boolean
}

interface ChatActions {
  initSessions: () => void
  createSession: () => string
  deleteSession: (id: string) => void
  switchSession: (id: string) => void
  setApiKey: (key: string) => void
  sendMessage: (content: string) => Promise<void>
  retryLastMessage: () => Promise<void>
  stopGeneration: () => void
}

export const useChatStore = create<ChatState & ChatActions>((set, get) => {
  let abortController: AbortController | null = null

  function persistSessions() {
    localStorage.setItem('deepseek_sessions', JSON.stringify(get().sessions))
  }

  function addMessage(sessionId: string, msg: ChatMessage) {
    const { sessions } = get()
    set({
      sessions: sessions.map((s) => {
        if (s.id !== sessionId) return s
        const newMsgs = [...s.messages, msg]
        let title = s.title
        if (msg.role === 'user' && newMsgs.filter((m) => m.role === 'user').length === 1) {
          title = msg.content.slice(0, 30) + (msg.content.length > 30 ? '...' : '')
        }
        return { ...s, messages: newMsgs, updatedAt: Date.now(), title }
      }),
    })
    persistSessions()
  }

  function updateLastAssistantMessage(sessionId: string, updater: (msg: ChatMessage) => void) {
    const { sessions } = get()
    set({
      sessions: sessions.map((s) => {
        if (s.id !== sessionId) return s
        const msgs = [...s.messages]
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i].role === 'assistant') {
            const updated = { ...msgs[i] }
            updater(updated)
            msgs[i] = updated
            break
          }
        }
        return { ...s, messages: msgs }
      }),
    })
  }

  return {
    sessions: [],
    activeSessionId: '',
    apiKey: typeof window !== 'undefined' ? localStorage.getItem('deepseek_api_key') || '' : '',
    isStreaming: false,

    initSessions: () => {
      const saved = localStorage.getItem('deepseek_sessions')
      if (saved) {
        try {
          const parsed: ChatSession[] = JSON.parse(saved)
          if (parsed.length > 0) {
            set({ sessions: parsed, activeSessionId: parsed[0].id })
            return
          }
        } catch {
          // corrupted data, start fresh
        }
      }
      const session = createEmptySession()
      set({ sessions: [session], activeSessionId: session.id })
      localStorage.setItem('deepseek_sessions', JSON.stringify([session]))
    },

    createSession: (): string => {
      const session = createEmptySession()
      set({ sessions: [session, ...get().sessions], activeSessionId: session.id })
      persistSessions()
      return session.id
    },

    deleteSession: (id: string) => {
      const { sessions, activeSessionId } = get()
      const idx = sessions.findIndex((s) => s.id === id)
      if (idx === -1) return

      const updated = [...sessions]
      updated.splice(idx, 1)

      if (activeSessionId === id) {
        if (updated.length > 0) {
          set({ sessions: updated, activeSessionId: updated[0].id })
        } else {
          const session = createEmptySession()
          set({ sessions: [session], activeSessionId: session.id })
        }
      } else {
        set({ sessions: updated })
      }
      persistSessions()
    },

    switchSession: (id: string) => {
      if (get().sessions.some((s) => s.id === id)) {
        set({ activeSessionId: id })
      }
    },

    setApiKey: (key: string) => {
      set({ apiKey: key })
      saveApiKey(key)
    },

    sendMessage: async (content: string) => {
      const sessionId = get().activeSessionId
      if (!sessionId || !content.trim()) return

      abortController = new AbortController()
      set({ isStreaming: true })

      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
      }
      addMessage(sessionId, userMsg)

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        reasoningContent: '',
        timestamp: Date.now(),
        isStreaming: true,
      }
      addMessage(sessionId, assistantMsg)

      const session = get().sessions.find((s) => s.id === sessionId)!
      const contextMessages = session.messages
        .filter((m) => m.role !== 'system' && m.id !== assistantMsg.id)
        .map((m) => ({ role: m.role, content: m.content }))

      let hasReasoning = false

      try {
        await streamChat(
          contextMessages,
          {
            onReasoning(text) {
              hasReasoning = true
              updateLastAssistantMessage(sessionId, (msg) => {
                msg.reasoningContent = (msg.reasoningContent || '') + text
              })
            },
            onContent(text) {
              updateLastAssistantMessage(sessionId, (msg) => {
                msg.content += text
              })
            },
            onError(error) {
              updateLastAssistantMessage(sessionId, (msg) => {
                msg.content = `错误：${error.message}`
                msg.isStreaming = false
              })
              persistSessions()
              set({ isStreaming: false })
            },
            onDone() {
              updateLastAssistantMessage(sessionId, (msg) => {
                msg.isStreaming = false
              })
              if (!hasReasoning) {
                updateLastAssistantMessage(sessionId, (msg) => {
                  msg.reasoningContent = undefined
                })
              }
              persistSessions()
              set({ isStreaming: false })
            },
          },
          abortController.signal
        )
      } catch (error: any) {
        if (error.name === 'AbortError') {
          updateLastAssistantMessage(sessionId, (msg) => {
            if (!msg.content) {
              msg.content = '已停止生成'
            }
            msg.isStreaming = false
          })
          persistSessions()
          return
        }
        updateLastAssistantMessage(sessionId, (msg) => {
          msg.content = `错误：${error.message}`
          msg.isStreaming = false
        })
        persistSessions()
      } finally {
        set({ isStreaming: false })
        abortController = null
      }
    },

    retryLastMessage: async () => {
      const { sessions, activeSessionId } = get()
      const session = sessions.find((s) => s.id === activeSessionId)
      if (!session) return

      const msgs = [...session.messages]
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'assistant') {
          msgs.splice(i, 1)
          break
        }
      }
      let lastUserContent = ''
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'user') {
          lastUserContent = msgs[i].content
          break
        }
      }

      if (lastUserContent) {
        await get().sendMessage(lastUserContent)
      }
    },

    stopGeneration: () => {
      if (abortController) {
        abortController.abort()
        abortController = null
      }
    },
  }
})
