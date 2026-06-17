import '../styles/globals.css'
import React from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { ThemeProvider } from '../components/ThemeProvider'

export const metadata = {
  title: 'Visiting Faculty Application Portal | LDCE',
  description: 'Apply forVisiting Faculty positions roles at L D College of Engineering ',
  keywords: 'LDCE, visiting faculty, gujarat, dte, directorate of technical education, government, teaching, engineering college, Ahmedabad',
  icons: {
    icon: '/ldce-logo.png',
    shortcut: '/ldce-logo.png',
    apple: '/ldce-logo.png'
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
