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
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
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
    if (isMobile) {
      setSidebarMobileOpen((prev) => !prev)
    } else {
      setSidebarCollapsed((prev) => !prev)
    }
  }, [isMobile])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar - slides over chat */}
      <div
        className={`fixed left-0 top-0 z-30 hidden h-full w-64 border-r bg-background shadow-lg transition-transform duration-300 md:block ${
          sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <ChatSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-background shadow-xl">
            <ChatSidebar />
          </div>
        </div>
      )}

      {/* Main Chat - always full width */}
      <div className="flex flex-1 min-w-0 relative">
        <ChatMain
          sidebarOpen={sidebarMobileOpen}
          onToggleSidebar={handleSidebarToggle}
          knowledgeOpen={knowledgeOpen}
          onToggleKnowledge={handleKnowledgeToggle}
        />

        {/* Desktop Knowledge Panel - slides over chat */}
        <div
          className={`fixed right-0 top-0 z-30 hidden h-full w-72 border-l bg-background shadow-lg transition-transform duration-300 md:block ${
            knowledgeOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="text-sm font-semibold">知识库</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setKnowledgeOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <KnowledgePanel />
          </div>
        </div>
      </div>

      {/* Mobile Sheet */}
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
