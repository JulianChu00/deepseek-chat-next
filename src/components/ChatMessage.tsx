'use client'

import { useMemo } from 'react'
import { marked } from 'marked'
import hljs from 'highlight.js'
import type { ChatMessage } from '../types/chat'
import { User, Bot } from 'lucide-react'

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
    <div className={`flex gap-3 py-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
        isUser ? 'border-primary bg-primary text-primary-foreground' : 'bg-muted text-foreground'
      }`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={`min-w-0 max-w-[75%] ${isUser ? 'items-end' : ''}`}>
        {message.reasoningContent && (
          <details className="mb-3">
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground select-none">
              💭 深度思考
            </summary>
            <pre className="mt-2 whitespace-pre-wrap break-words rounded-md border bg-muted/50 p-3 text-xs text-muted-foreground leading-relaxed">
              {message.reasoningContent}
            </pre>
          </details>
        )}

        {isUser ? (
          <div className="rounded-2xl rounded-tr-md bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
            {message.content}
          </div>
        ) : message.content ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed 
              [&_pre]:rounded-lg [&_pre]:border [&_pre]:bg-muted [&_pre]:p-4 
              [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm
              [&_pre_code]:bg-transparent [&_pre_code]:p-0
              [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground
              [&_table]:w-full [&_th]:border [&_th]:px-3 [&_th]:py-1.5 [&_td]:border [&_td]:px-3 [&_td]:py-1.5"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        ) : null}

        {message.isStreaming && (
          <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-text-bottom" />
        )}
      </div>
    </div>
  )
}
