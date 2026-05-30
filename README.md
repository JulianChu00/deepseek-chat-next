# DeepSeek Chat Next

基于 [DeepSeek API](https://platform.deepseek.com/) 的多轮对话应用，使用 Next.js 16 (App Router) + Turbopack 构建。

🔗 **在线体验**：[deepseek-chat-next.vercel.app](https://deepseek-chat-next.vercel.app/)

## 功能特性

- 🤖 **DeepSeek V4 流式对话** — SSE 实时流式输出，支持深度思考（Reasoning）展示
- 💬 **多会话管理** — 创建、切换、删除聊天会话，localStorage 持久化
- 📝 **Markdown 渲染** — 基于 marked + highlight.js，支持代码高亮
- ⏹ **随时停止生成** — AbortController 中断请求，重试最后一条消息
- 🔑 **自定义 API Key** — 支持在页面中覆盖默认 Key

## 技术栈

| 技术 | 用途 |
|------|------|
| [Next.js 16](https://nextjs.org/) | React 全栈框架 (App Router + Turbopack) |
| [React 19](https://react.dev/) | UI 框架 |
| [Zustand](https://zustand.docs.pmnd.rs/) | 轻量级状态管理 |
| [marked](https://marked.js.org/) | Markdown 解析 |
| [highlight.js](https://highlightjs.org/) | 代码语法高亮 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全 |

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/JulianChu00/deepseek-chat-next.git
cd deepseek-chat-next
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 DeepSeek API Key：

```env
NEXT_PUBLIC_DEEPSEEK_API_KEY=sk-your-key-here
```

> 在 [DeepSeek 开放平台](https://platform.deepseek.com/api_keys) 获取 API Key。

### 3. 安装依赖

```bash
npm install
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。

## 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FJulianChu00%2Fdeepseek-chat-next)

1. 点击上方按钮或手动导入 GitHub 仓库
2. 在 Vercel 项目设置中添加环境变量：

   ```
   NEXT_PUBLIC_DEEPSEEK_API_KEY = sk-your-key-here
   ```

3. 部署即可

## 项目结构

```
deepseek-chat-next/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   └── globals.css         # 全局样式
├── src/
│   ├── api/
│   │   └── deepseek.ts     # DeepSeek SSE 流式 API
│   ├── components/
│   │   ├── ChatMain.tsx    # 聊天主区域
│   │   ├── ChatMessage.tsx # 消息气泡组件
│   │   └── ChatSidebar.tsx # 侧边栏组件
│   ├── hooks/
│   │   └── useChatStore.ts # Zustand 状态管理
│   └── types/
│       └── chat.ts         # TypeScript 类型
├── .env.example            # 环境变量模板
└── package.json
```

## License

MIT
