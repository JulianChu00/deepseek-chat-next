'use client'

import { useChatStore } from '../hooks/useChatStore'

export default function ChatSidebar() {
  const sessions = useChatStore((s) => s.sessions)
  const activeSessionId = useChatStore((s) => s.activeSessionId)
  const createSession = useChatStore((s) => s.createSession)
  const deleteSession = useChatStore((s) => s.deleteSession)
  const switchSession = useChatStore((s) => s.switchSession)

  const sortedSessions = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">DeepSeek Chat</span>
      </div>

      <button className="new-chat-btn" onClick={() => createSession()}>
        + 新建对话
      </button>

      <div className="session-list">
        {sortedSessions.map((s) => (
          <div
            key={s.id}
            className={`session-item${s.id === activeSessionId ? ' active' : ''}`}
            onClick={() => switchSession(s.id)}
          >
            <span className="session-text">{s.title}</span>
            {sessions.length > 1 && (
              <button
                className="session-del"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteSession(s.id)
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
