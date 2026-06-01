import type { ChatMessage } from '../types/chat'

export function exportToMarkdown(
  messages: ChatMessage[],
  title: string
): void {
  let md = `# ${title}\n\n`

  for (const msg of messages) {
    if (msg.role === 'system') continue

    const roleName = msg.role === 'user' ? '👤 用户' : '🤖 DeepSeek'
    md += `## ${roleName}\n\n`

    if (msg.reasoningContent) {
      md += `> 💭 深度思考\n>\n`
      md += msg.reasoningContent.split('\n').map((l) => `> ${l}`).join('\n')
      md += '\n\n'
    }

    md += msg.content + '\n\n---\n\n'
  }

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  downloadBlob(blob, `${title}.md`)
}

export async function exportToImage(element: HTMLElement): Promise<void> {
  if (typeof window === 'undefined') return

  const { toPng } = await import('html-to-image')
  const dataUrl = await toPng(element, {
    backgroundColor: getComputedStyle(document.documentElement)
      .getPropertyValue('--background')
      .trim() || '#ffffff',
    pixelRatio: 2,
  })

  const link = document.createElement('a')
  link.download = `chat-${Date.now()}.png`
  link.href = dataUrl
  link.click()
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
