'use client'

import { create } from 'zustand'
import type { KnowledgeDoc } from '../types/knowledge'
import { splitText } from '../utils/chunking'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// ---- IndexedDB helpers ----

const DB_NAME = 'deepseek_knowledge'
const DB_VERSION = 1
const STORE_NAME = 'docs'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function persistDocs(docs: KnowledgeDoc[]): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  store.clear()
  for (const doc of docs) {
    store.put(doc)
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function loadDocs(): Promise<KnowledgeDoc[]> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  return new Promise((resolve, reject) => {
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => reject(req.error)
  })
}

// ---- Store ----

interface KnowledgeState {
  docs: KnowledgeDoc[]
  isProcessing: boolean
  processingStatus: string
}

interface KnowledgeActions {
  init: () => Promise<void>
  addDocument: (file: File) => Promise<void>
  addTextDocument: (filename: string, text: string) => Promise<void>
  addUrlDocument: (url: string) => Promise<void>
  deleteDocument: (docId: string) => Promise<void>
  clearAll: () => Promise<void>
}

export const useKnowledgeStore = create<KnowledgeState & KnowledgeActions>((set, get) => ({
  docs: [],
  isProcessing: false,
  processingStatus: '',

  init: async () => {
    try {
      const docs = await loadDocs()
      set({ docs })
    } catch (err) {
      console.error('Failed to load knowledge docs:', err)
    }
  },

  addDocument: async (file: File) => {
    set({ isProcessing: true, processingStatus: `正在读取 ${file.name}...` })

    try {
      const text = await readFileContent(file)
      await get().addTextDocument(file.name, text)
    } catch (err: any) {
      set({ isProcessing: false, processingStatus: '' })
      throw err
    }
  },

  addTextDocument: async (filename: string, text: string) => {
    set({ isProcessing: true, processingStatus: `首次使用会下载约25MB模型，之后离线运行。正在分块 "${filename}"...` })

    const chunkTexts = splitText(text)

    if (chunkTexts.length === 0) {
      set({ isProcessing: false, processingStatus: '' })
      throw new Error('文档内容为空，无法分块')
    }

    set({ processingStatus: `正在向量化 ${chunkTexts.length} 个片段...` })

    // Embed in batches of 20 to avoid overwhelming the API
    const BATCH_SIZE = 20
    const allEmbeddings: number[][] = []

    for (let i = 0; i < chunkTexts.length; i += BATCH_SIZE) {
      const batch = chunkTexts.slice(i, i + BATCH_SIZE)
      set({ processingStatus: `正在向量化... (${i + 1}/${chunkTexts.length})` })
      const { batchEmbed } = await import("../api/embedding")
      const embeddings = await batchEmbed(batch)
      allEmbeddings.push(...embeddings)
    }

    const docId = generateId()
    const chunks = chunkTexts.map((content, index) => ({
      id: generateId(),
      docId,
      content,
      index,
      embedding: allEmbeddings[index],
    }))

    const newDoc: KnowledgeDoc = {
      id: docId,
      filename,
      chunks,
      createdAt: Date.now(),
    }

    const updatedDocs = [...get().docs, newDoc]
    await persistDocs(updatedDocs)
    set({
      docs: updatedDocs,
      isProcessing: false,
      processingStatus: '',
    })
  },

  addUrlDocument: async (url: string) => {
    set({ isProcessing: true, processingStatus: `正在抓取 ${url}...` })

    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      // Simple HTML text extraction
      const doc = new DOMParser().parseFromString(data.html, 'text/html')
      doc.querySelectorAll('script, style, nav, footer, header, noscript').forEach((e) => e.remove())
      const text = doc.body?.textContent?.replace(/\s{3,}/g, '\n\n').trim() || ''

      if (!text) {
        throw new Error('未从页面中提取到有效文本')
      }

      const filename = url.replace(/^https?:\/\//, '').replace(/\/$/, '') + '.txt'
      await get().addTextDocument(filename, text)
    } catch (err: any) {
      set({ isProcessing: false, processingStatus: '' })
      throw err
    }
  },

  deleteDocument: async (docId: string) => {
    const updatedDocs = get().docs.filter((d) => d.id !== docId)
    await persistDocs(updatedDocs)
    set({ docs: updatedDocs })
  },

  clearAll: async () => {
    await persistDocs([])
    set({ docs: [] })
  },
}))

// ---- File reading helpers ----

async function readFileContent(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase()

  switch (ext) {
    case 'txt':
    case 'md':
    case 'markdown':
    case 'json':
    case 'csv':
    case 'xml':
    case 'html':
    case 'htm':
    case 'yaml':
    case 'yml':
    case 'toml':
    case 'py':
    case 'js':
    case 'ts':
    case 'tsx':
    case 'jsx':
    case 'css':
    case 'scss':
    case 'less':
    case 'sql':
    case 'sh':
    case 'bash':
      return await file.text()

    case 'pdf':
      return await readPdfContent(file)

    default:
      // Try reading as text; if it looks binary, error out
      const text = await file.text()
      if (looksLikeBinary(text.slice(0, 1000))) {
        throw new Error(`不支持的文件格式: .${ext}（支持 TXT、MD、PDF 等文本文件）`)
      }
      return text
  }
}

function looksLikeBinary(text: string): boolean {
  // If more than 10% are null or control characters (excluding tab/newline), treat as binary
  let control = 0
  for (let i = 0; i < text.length && i < 1000; i++) {
    const c = text.charCodeAt(i)
    if (c === 0 || (c < 32 && c !== 9 && c !== 10 && c !== 13)) {
      control++
    }
  }
  return control / Math.min(text.length, 1000) > 0.1
}

async function readPdfContent(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  const { getDocument } = pdfjs

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await getDocument({ data: arrayBuffer }).promise

  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const text = content.items
      .filter((item: any) => item.str)
      .map((item: any) => item.str)
      .join(' ')
    pages.push(text)
  }

  return pages.join('\n\n')
}
