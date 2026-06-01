'use client'

import { useChatStore } from '../hooks/useChatStore'
import { useThemeStore } from '../hooks/useThemeStore'
import { MODEL_OPTIONS } from '../types/chat'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Plus, Trash2, Sun, Moon, MessageSquare, Sparkles } from 'lucide-react'

export default function ChatSidebar() {
  const sessions = useChatStore((s) => s.sessions)
  const activeSessionId = useChatStore((s) => s.activeSessionId)
  const model = useChatStore((s) => s.model)
  const createSession = useChatStore((s) => s.createSession)
  const deleteSession = useChatStore((s) => s.deleteSession)
  const switchSession = useChatStore((s) => s.switchSession)
  const setModel = useChatStore((s) => s.setModel)

  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggle)

  const sortedSessions = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="flex items-center gap-2 px-4 py-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="font-semibold">DeepSeek Chat</span>
      </div>

      <div className="px-3 pb-3">
        <Button variant="outline" className="w-full justify-start gap-2" onClick={() => createSession()}>
          <Plus className="h-4 w-4" />
          新建对话
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-0.5">
          {sortedSessions.map((s) => (
            <button
              key={s.id}
              onClick={() => switchSession(s.id)}
              className={`group flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                s.id === activeSessionId
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 truncate">{s.title}</span>
              {sessions.length > 1 && (
                <Trash2
                  className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-50 hover:!opacity-100 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSession(s.id)
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </ScrollArea>

      <div className="flex flex-col gap-2 border-t p-3">
        <Select value={model} onValueChange={(v) => setModel(v as typeof model)}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODEL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="ghost" className="w-full justify-start gap-2" onClick={toggleTheme}>
          {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {theme === 'dark' ? '暗色模式' : '亮色模式'}
        </Button>
      </div>
    </div>
  )
}
