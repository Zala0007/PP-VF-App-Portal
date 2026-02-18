import '../styles/globals.css'
import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { ThemeProvider } from '../components/ThemeProvider'

export const metadata = {
  title: 'Professor in Practice & Visiting Faculty Application Portal | DTE Gujarat',
  description: 'Apply for Professor in Practice and Visiting Faculty positions roles at Government Engineering Colleges ',
  keywords: 'LDCE, visiting faculty, professor in practice, gujarat, dte, directorate of technical education, government, teaching, engineering college, Ahmedabad',
  icons: {
    icon: '/dte-logo-meta.png',
    shortcut: '/dte-logo-meta.png',
    apple: '/dte-logo-meta.png'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
