import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DeepSeek Chat - 多轮对话',
  description: '基于 DeepSeek API 的多轮对话应用',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
