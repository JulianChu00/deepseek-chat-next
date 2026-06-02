'use client'

import { useEffect, useState, useCallback } from 'react'
import ChatSidebar from '../src/components/ChatSidebar'
import ChatMain from '../src/components/ChatMain'
import KnowledgePanel from '../src/components/KnowledgePanel'
import { useChatStore } from '../src/hooks/useChatStore'
import { useKnowledgeStore } from '../src/hooks/useKnowledgeStore'
import { Sheet, SheetContent } from '../src/components/ui/sheet'
import { Button } from '../src/components/ui/button'
import { X } from 'lucide-react'

export default function Home() {
  const initSessions = useChatStore((s) => s.initSessions)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [knowledgeOpen, setKnowledgeOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    initSessions()
    useKnowledgeStore.getState().init()
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [initSessions])

  const handleKnowledgeToggle = useCallback(() => {
    setKnowledgeOpen((prev) => !prev)
  }, [])

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden w-64 shrink-0 md:block">
        <ChatSidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-background shadow-xl">
            <ChatSidebar />
          </div>
        </div>
      )}

      <div className="flex flex-1 min-w-0">
        <ChatMain
          sidebarOpen={sidebarOpen}
          onToggleSidebar={handleSidebarToggle}
          knowledgeOpen={knowledgeOpen}
          onToggleKnowledge={handleKnowledgeToggle}
        />

        {knowledgeOpen && !isMobile && (
          <div className="w-72 shrink-0 border-l flex flex-col bg-background">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="text-sm font-semibold">知识库</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setKnowledgeOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <KnowledgePanel />
          </div>
        )}
      </div>

      {isMobile && (
        <Sheet open={knowledgeOpen} onOpenChange={setKnowledgeOpen}>
          <SheetContent side="right" className="w-[85vw] p-4">
            <KnowledgePanel />
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
