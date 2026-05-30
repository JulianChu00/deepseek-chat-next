'use client'

import { useEffect } from 'react'
import ChatSidebar from '../src/components/ChatSidebar'
import ChatMain from '../src/components/ChatMain'
import { useChatStore } from '../src/hooks/useChatStore'

export default function Home() {
  const initSessions = useChatStore((s) => s.initSessions)

  useEffect(() => {
    initSessions()
  }, [initSessions])

  return (
    <div className="root">
      <ChatSidebar />
      <ChatMain />
    </div>
  )
}
