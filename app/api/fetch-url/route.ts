import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: '缺少 url 参数' }, { status: 400 })
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DeepSeekChat/1.0)',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `抓取失败: HTTP ${response.status}` },
        { status: 502 }
      )
    }

    const html = await response.text()
    return NextResponse.json({ html })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
