"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { useState } from 'react'
import Image from 'next/image'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Vacancy', href: '/vacancy' },
  { label: 'Apply', href: '/apply' },
  { label: 'Resources', href: '/resources' }
]

const showVacancy = false
const applicationsOpen = false

export default function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 glass border-b border-gray-200/50 dark:bg-[#111827] dark:border-white/10 dark:shadow-sm"
    >
      <nav className="container-custom py-4 pl-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4 group">
            <a href="https://ldce.ac.in/" target="_blank" rel="noopener noreferrer" aria-label="LDCE website">
              <div className="relative">
                <div className="absolute inset-0 bg-black dark:bg-white blur-lg opacity-0 group-hover:opacity-30 transition-opacity" />
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <Image
                    src="/ldce-logo.png"
                    alt="LDCE Logo"
                    width={75}
                    height={75}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </a>
            <a href="https://dte.gujarat.gov.in/" target="_blank" rel="noopener noreferrer" aria-label="DTE Gujarat">
              <div className="relative">
                <div className="absolute inset-0 bg-black dark:bg-white blur-lg opacity-0 group-hover:opacity-30 transition-opacity" />
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <Image
                    src="/dte-logo.png"
                    alt="DTE Logo"
                    width={75}
                    height={75}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </a>
          </div>

          {/* Desktop Navigation & Theme Toggle */}
          <div className="hidden md:flex items-center gap-8">
            {navItems
              .filter((item) => showVacancy || item.href !== '/vacancy')
              .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-disabled={!applicationsOpen && item.href === '/apply'}
                tabIndex={!applicationsOpen && item.href === '/apply' ? -1 : undefined}
                onClick={(event) => {
                  if (!applicationsOpen && item.href === '/apply') event.preventDefault()
                }}
                className={`relative font-medium transition-colors ${
                  !applicationsOpen && item.href === '/apply'
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed pointer-events-none'
                    :
                  pathname === item.href
                    ? 'text-primary-600 dark:text-blue-400'
                    : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-blue-400'
                }`}
              >
                {item.label}
                {pathname === item.href && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-accent-600 dark:from-blue-500 dark:to-fuchsia-500"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="flex md:hidden items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-full bg-gray-200 text-gray-900 dark:bg-white/10 dark:text-white flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-white/10 pt-4"
          >
            <div className="flex flex-col gap-4">
              {navItems
                .filter((item) => showVacancy || item.href !== '/vacancy')
                .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-disabled={!applicationsOpen && item.href === '/apply'}
                  tabIndex={!applicationsOpen && item.href === '/apply' ? -1 : undefined}
                  onClick={(event) => {
                    if (!applicationsOpen && item.href === '/apply') {
                      event.preventDefault()
                      return
                    }
                    setMobileMenuOpen(false)
                  }}
                  className={`font-medium px-4 py-2 rounded-lg transition-colors ${
                    !applicationsOpen && item.href === '/apply'
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed pointer-events-none'
                      :
                    pathname === item.href
                      ? 'bg-primary-100 text-primary-700 dark:bg-white/10 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  )
}
