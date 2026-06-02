'use client'

import { useEffect, useState, useCallback } from 'react'
import ChatSidebar from '../src/components/ChatSidebar'
import ChatMain from '../src/components/ChatMain'
import KnowledgePanel from '../src/components/KnowledgePanel'
import { useChatStore } from '../src/hooks/useChatStore'
import { useKnowledgeStore } from '../src/hooks/useKnowledgeStore'
import { Sheet, SheetContent } from '../src/components/ui/sheet'

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
      {/* Desktop Sidebar */}
      <div className="hidden w-64 shrink-0 md:block">
        <ChatSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-background shadow-xl">
            <ChatSidebar />
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex flex-1 min-w-0">
        <ChatMain
          sidebarOpen={sidebarOpen}
          onToggleSidebar={handleSidebarToggle}
          knowledgeOpen={knowledgeOpen}
          onToggleKnowledge={handleKnowledgeToggle}
        />

        {/* Desktop: inline knowledge panel */}
        {knowledgeOpen && !isMobile && (
          <div className="w-72 shrink-0 border-l">
            <KnowledgePanel onClose={() => setKnowledgeOpen(false)} />
          </div>
        )}
      </div>

      {/* Mobile: Sheet Drawer */}
      {isMobile && (
        <Sheet open={knowledgeOpen} onOpenChange={setKnowledgeOpen}>
          <SheetContent side="right" className="w-[85vw] p-0">
            <KnowledgePanel onClose={() => setKnowledgeOpen(false)} />
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
