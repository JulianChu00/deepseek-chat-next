import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DeepSeek Chat',
  description: '基于 DeepSeek API 的多轮对话应用，支持知识库 RAG 检索增强',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try {
    var t = localStorage.getItem('deepseek_theme');
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (t === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})()`,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
