'use client'

import { create } from 'zustand'

type Theme = 'light' | 'dark'

function getBrowserTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
}

interface ThemeState {
  theme: Theme
  resolvedTheme: Theme
  toggle: () => void
}

// Auto-init: resolve theme immediately on module load
function resolveTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem('deepseek_theme') as Theme | null
  if (saved === 'dark' || saved === 'light') return saved
  return getBrowserTheme()
}

const initialTheme = resolveTheme()

// Apply immediately (before React hydrates) to prevent flash
if (typeof window !== 'undefined') {
  applyTheme(initialTheme)
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  resolvedTheme: initialTheme,

  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('deepseek_theme', next)
    applyTheme(next)
    set({ theme: next, resolvedTheme: next })
  },
}))
