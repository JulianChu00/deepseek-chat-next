'use client'

import { useState, useRef, useEffect } from 'react'
import { useChatStore } from '../hooks/useChatStore'
import ChatMessageComponent from './ChatMessage'

export default function ChatMain() {
  const sessions = useChatStore((s) => s.sessions)
  const activeSessionId = useChatStore((s) => s.activeSessionId)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const stopGeneration = useChatStore((s) => s.stopGeneration)

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null

  const [inputText, setInputText] = useState('')
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    requestAnimationFrame(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      }
    })
  }, [activeSession?.messages, activeSessionId])

  useEffect(() => {
    setInputText('')
  }, [activeSessionId])

  async function handleSend() {
    const text = inputText.trim()
    if (!text || isStreaming) return
    setInputText('')
    await sendMessage(text)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!activeSession) {
    return (
      <div className="main">
        <div className="empty">
          <div className="empty-icon">🤖</div>
          <div>选择或创建一个对话开始聊天</div>
        </div>
      </div>
    )
  }

  return (
    <div className="main">
      <div className="topbar">
        {activeSession.title}
      </div>

      <div ref={chatContainerRef} className="messages">
        {activeSession.messages.length === 0 ? (
          <div className="empty">
            <div>开始和 DeepSeek 对话吧</div>
          </div>
        ) : (
          activeSession.messages.map((msg) => (
            <ChatMessageComponent key={msg.id} message={msg} />
          ))
        )}
      </div>

      <div className="input-row">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="input-text"
          placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
          rows={1}
          disabled={isStreaming}
          onKeyDown={handleKeyDown}
        />
        {!isStreaming ? (
          <button
            className="send-btn"
            disabled={!inputText.trim()}
            onClick={handleSend}
          >
            发送
          </button>
        ) : (
          <button
            className="stop-btn"
            onClick={stopGeneration}
          >
            停止
          </button>
        )}
      </div>
    </div>
  )
}
