"use client"

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative w-10 h-10 rounded-full bg-gray-600 dark:bg-white flex items-center justify-center hover:scale-110 transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      <Sun className="w-5 h-5 text-amber-500 absolute rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
      <Moon className="w-5 h-5 text-indigo-500 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-accent-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
    </button>
  )
}
