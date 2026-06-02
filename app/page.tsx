'use client'

import { useEffect, useState, useCallback } from 'react'
import ChatSidebar from '../src/components/ChatSidebar'
import ChatMain from '../src/components/ChatMain'
import KnowledgePanel from '../src/components/KnowledgePanel'
import { useChatStore } from '../src/hooks/useChatStore'
import { useKnowledgeStore } from '../src/hooks/useKnowledgeStore'
import { Sheet, SheetContent } from '../src/components/ui/sheet'
import { Button } from '../src/components/ui/button'
import { X, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

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

  const sidebarWidth = sidebarCollapsed ? 'w-0' : 'w-64'

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar with animation */}
      <div
        className={`hidden md:block shrink-0 overflow-hidden border-r transition-all duration-300 ${sidebarWidth}`}
      >
        <ChatSidebar />
      </div>

      {/* Collapsed sidebar toggle button */}
      {sidebarCollapsed && !isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-3 z-30 h-8 w-8 rounded-l-none border border-l-0"
          onClick={() => setSidebarCollapsed(false)}
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-background shadow-xl">
            <ChatSidebar />
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex flex-1 min-w-0">
        <ChatMain
          sidebarOpen={sidebarMobileOpen}
          onToggleSidebar={handleSidebarToggle}
          knowledgeOpen={knowledgeOpen}
          onToggleKnowledge={handleKnowledgeToggle}
        />

        {/* Desktop Knowledge Panel with slide animation */}
        <div
          className={`hidden md:flex shrink-0 flex-col border-l bg-background overflow-hidden transition-all duration-300 ${
            knowledgeOpen ? 'w-72' : 'w-0 border-l-0'
          }`}
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-semibold whitespace-nowrap">知识库</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setKnowledgeOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <KnowledgePanel />
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
