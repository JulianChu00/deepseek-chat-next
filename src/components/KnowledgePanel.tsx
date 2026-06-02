'use client'

import { useState, useRef, useEffect } from 'react'
import { useKnowledgeStore } from '../hooks/useKnowledgeStore'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Upload, Globe, Trash2, Paperclip, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function KnowledgePanel() {
  const docs = useKnowledgeStore((s) => s.docs)
  const isProcessing = useKnowledgeStore((s) => s.isProcessing)
  const processingStatus = useKnowledgeStore((s) => s.processingStatus)
  const addDocument = useKnowledgeStore((s) => s.addDocument)
  const addUrlDocument = useKnowledgeStore((s) => s.addUrlDocument)
  const deleteDocument = useKnowledgeStore((s) => s.deleteDocument)
  const clearAll = useKnowledgeStore((s) => s.clearAll)
  const init = useKnowledgeStore((s) => s.init)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState('')
  const [statusMsg, setStatusMsg] = useState('')
  const [statusType, setStatusType] = useState<'info' | 'error'>('info')

  useEffect(() => { init() }, [init])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatusMsg('')
    try {
      await addDocument(file)
      setStatusMsg(`"${file.name}" 已添加`)
      setStatusType('info')
    } catch (err: any) {
      setStatusMsg(err.message)
      setStatusType('error')
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleUrlAdd() {
    const t = url.trim()
    if (!t) return
    setStatusMsg('')
    try {
      await addUrlDocument(t)
      setUrl('')
      setStatusMsg('网页已添加')
      setStatusType('info')
    } catch (err: any) {
      setStatusMsg(err.message)
      setStatusType('error')
    }
  }

  const totalChunks = docs.reduce((s, d) => s + d.chunks.length, 0)

  return (
    <div className="h-full overflow-y-auto px-4 py-3">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">上传文档</label>
          <input ref={fileInputRef} type="file" accept=".txt,.md,.pdf,.json,.csv,.html,.py,.js,.ts,.tsx,.css,.yaml,.yml" onChange={handleFileUpload} className="hidden" disabled={isProcessing} />
          <Button variant="outline" className="w-full gap-2" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
            <Upload className="h-4 w-4 shrink-0" />
            选择文件
          </Button>
          <p className="text-xs text-muted-foreground">TXT, MD, PDF, 代码等</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">抓取网页</label>
          <div className="flex gap-2">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." disabled={isProcessing} onKeyDown={(e) => e.key === 'Enter' && handleUrlAdd()} />
            <Button size="sm" className="shrink-0 gap-1.5" onClick={handleUrlAdd} disabled={isProcessing || !url.trim()}>
              <Globe className="h-3.5 w-3.5" />
              抓取
            </Button>
          </div>
        </div>

        {isProcessing && (
          <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs">
            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
            {processingStatus}
          </div>
        )}
        {statusMsg && (
          <div className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs ${statusType === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-muted'}`}>
            {statusType === 'error' ? <AlertCircle className="h-3.5 w-3.5 shrink-0" /> : <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
            {statusMsg}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {docs.length} 文档 · {totalChunks} 片段
            </span>
            {docs.length > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={clearAll}>
                清空
              </Button>
            )}
          </div>
          {docs.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">暂无文档</p>
          ) : (
            <div className="space-y-1">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 rounded-md border px-3 py-2">
                  <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{doc.filename}</p>
                    <p className="text-xs text-muted-foreground">{doc.chunks.length} 片段</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => deleteDocument(doc.id)} disabled={isProcessing}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
