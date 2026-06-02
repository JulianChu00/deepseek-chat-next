'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useChatStore } from '../hooks/useChatStore'
import { useKnowledgeStore } from '../hooks/useKnowledgeStore'
import ChatMessageComponent from './ChatMessage'
import { countSessionTokens } from '../utils/tokenCounter'
import { exportToMarkdown, exportToImage } from '../utils/export'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Menu, Library, Download, FileText, Image, Send, Square } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface Props {
  sidebarOpen: boolean
  onToggleSidebar: () => void
  knowledgeOpen: boolean
  onToggleKnowledge: () => void
}

export default function ChatMain({ sidebarOpen, onToggleSidebar, knowledgeOpen, onToggleKnowledge }: Props) {
  const sessions = useChatStore((s) => s.sessions)
  const activeSessionId = useChatStore((s) => s.activeSessionId)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const stopGeneration = useChatStore((s) => s.stopGeneration)
  const knowledgeDocs = useKnowledgeStore((s) => s.docs)

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null
  const [inputText, setInputText] = useState('')
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const tokenCount = useMemo(
    () => (activeSession ? countSessionTokens(activeSession.messages) : 0),
    [activeSession?.messages]
  )

  const knowledgeChunkCount = useMemo(
    () => knowledgeDocs.reduce((sum, d) => sum + d.chunks.length, 0),
    [knowledgeDocs]
  )

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

  async function handleExportImage() {
    if (!chatContainerRef.current) return
    await exportToImage(chatContainerRef.current)
  }

  function handleExportMarkdown() {
    if (!activeSession) return
    exportToMarkdown(activeSession.messages, activeSession.title)
  }

  if (!activeSession) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">选择或创建一个对话开始聊天</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col min-w-0">
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={onToggleSidebar}>
          <Menu className="h-4 w-4" />
        </Button>
        <span className="flex-1 truncate text-sm text-muted-foreground">
          {activeSession.title}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant={knowledgeOpen ? 'secondary' : 'ghost'}
            size="sm"
            className="gap-1.5"
            onClick={onToggleKnowledge}
          >
            <Library className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">知识库</span>
            {knowledgeChunkCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0 text-[10px] font-medium text-primary-foreground">
                {knowledgeChunkCount}
              </span>
            )}
          </Button>

          {activeSession.messages.length > 0 && (
            <>
              <span className="hidden rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground sm:inline">
                ≈{tokenCount}t
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">导出</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportMarkdown}>
                    <FileText className="h-4 w-4" />
                    导出 Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportImage}>
                    <Image className="h-4 w-4" />
                    导出图片
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto">
        {activeSession.messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">开始和 DeepSeek 对话吧</p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl px-4">
            {activeSession.messages.map((msg) => (
              <ChatMessageComponent key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="mx-auto flex max-w-3xl gap-2">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
            rows={1}
            disabled={isStreaming}
            onKeyDown={handleKeyDown}
            className="min-h-10 resize-none"
          />
          {isStreaming ? (
            <Button variant="destructive" size="icon" className="h-10 w-10 shrink-0" onClick={stopGeneration}>
              <Square className="h-4 w-4 fill-current" />
            </Button>
          ) : (
            <Button size="icon" className="h-10 w-10 shrink-0" disabled={!inputText.trim()} onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
