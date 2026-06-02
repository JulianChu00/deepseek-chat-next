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

  const toggleDesktopSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  const toggleMobileSidebar = useCallback(() => {
    setSidebarMobileOpen((prev) => !prev)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:block shrink-0 overflow-hidden border-r transition-[width] duration-300 ${
          sidebarCollapsed ? 'w-0 border-r-0' : 'w-64'
        }`}
      >
        <div className="w-64 h-full">
          <ChatSidebar onToggleCollapse={toggleDesktopSidebar} />
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-background shadow-xl">
            <ChatSidebar onToggleCollapse={() => setSidebarMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex flex-1 min-w-0">
        <ChatMain
          sidebarCollapsed={sidebarCollapsed}
          sidebarOpen={sidebarMobileOpen || !sidebarCollapsed}
          onToggleSidebar={isMobile ? toggleMobileSidebar : toggleDesktopSidebar}
          knowledgeOpen={knowledgeOpen}
          onToggleKnowledge={handleKnowledgeToggle}
        />

        {/* Desktop Knowledge Panel */}
        <div
          className={`hidden md:block shrink-0 overflow-hidden border-l transition-[width] duration-300 ${
            knowledgeOpen ? 'w-72' : 'w-0 border-l-0'
          }`}
        >
          <div className="w-72 h-full flex flex-col bg-background">
            <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
              <span className="text-sm font-semibold whitespace-nowrap">知识库</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setKnowledgeOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <KnowledgePanel />
          </div>
        </div>
      </div>

      {/* Mobile Knowledge Sheet */}
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
