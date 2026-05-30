'use client'

import { useMemo } from 'react'
import { marked } from 'marked'
import hljs from 'highlight.js'
import type { ChatMessage } from '../types/chat'

marked.setOptions({ breaks: true, gfm: true })

function renderMarkdown(text: string): string {
  if (!text) return ''
  const html = marked.parse(text) as string
  const div = document.createElement('div')
  div.innerHTML = html
  div.querySelectorAll('pre code').forEach((b) => hljs.highlightElement(b as HTMLElement))
  return div.innerHTML
}

interface Props {
  message: ChatMessage
}

export default function ChatMessageComponent({ message }: Props) {
  const renderedContent = useMemo(() => renderMarkdown(message.content), [message.content])
  const isUser = message.role === 'user'

  return (
    <div className={`msg-row${isUser ? ' user' : ''}`}>
      <div className="msg-avatar">{isUser ? '👤' : '🤖'}</div>
      <div className="msg-body">
        {message.reasoningContent && (
          <div className="reasoning">
            <div className="reasoning-title">💭 深度思考</div>
            <pre className="reasoning-text">{message.reasoningContent}</pre>
          </div>
        )}

        {isUser ? (
          <div className="bubble-user">{message.content}</div>
        ) : message.content ? (
          <div className="markdown-body" dangerouslySetInnerHTML={{ __html: renderedContent }} />
        ) : null}

        {message.isStreaming && <span className="cursor" />}
      </div>
    </div>
  )
}
