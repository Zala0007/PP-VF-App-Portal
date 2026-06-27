"use client"

import { Mail, MapPin, Phone, Linkedin, Instagram, Facebook } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const showVacancy = false

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <a href="https://ldce.ac.in/" target="_blank" rel="noopener noreferrer">
                <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden hover:scale-110 transition-transform">
                  <Image 
                    src="/ldce-logo.png" 
                    alt="LDCE Logo" 
                    width={40} 
                    height={40}
                    className="object-contain p-0.5"
                  />
                </div>
              </a>
              <div>
                <div className="font-bold text-lg text-gray-600 dark:white">
                  LDCE
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>L.D. College of Engineering</strong> - Empowering excellence in education and research.
            </p>
            <ul className="space-y-3 pt-2">
              <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a 
                  href="https://maps.app.goo.gl/oKeEZUgz59MVWX6CA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  LDCE, 120, Circular Road, University Area, Ahmedabad, Gujarat 380015
                </a>
              </li>
              
              <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:office@ldce.ac.in" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  office@ldce.ac.in
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/apply"
                  aria-disabled="true"
                  tabIndex={-1}
                  onClick={(event) => event.preventDefault()}
                  className="text-sm text-gray-400 dark:text-gray-600 cursor-not-allowed pointer-events-none"
                >
                  Apply Now
                </Link>
              </li>
              <li>
                {showVacancy && (
                  <Link href="/vacancy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    Vacancy
                  </Link>
                )}
              </li>
              <li>
                <Link href="/admin" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://gtu.ac.in/syllabus/syllabus.aspx" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  GTU Syllabus
                </a>
              </li>
              <li>
                <a href="https://www.gtu.ac.in/AcademicCal.aspx" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Academic Calendar
                </a>
              </li>
              <li>
                <Link href="/resources#norms-remuneration" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Notice and Circular
                </Link>
              </li>
            </ul>
          </div>

          {/* Rights */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              © {currentYear} L.D. College of Engineering.
              <br></br>
               All Rights Reserved.
            </p>
            <div className="flex items-center gap-3 mb-4">
              <a 
                href="https://www.linkedin.com/school/l.d-college-of-engineering---ahmedabad/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center justify-center transition-all hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-[#0A66C2]" />
              </a>
              <a 
                href="https://www.instagram.com/ldceofficial/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-pink-50 dark:bg-pink-950/40 border border-pink-100 dark:border-pink-800/50 hover:bg-pink-100 dark:hover:bg-pink-900/60 flex items-center justify-center transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-[#E4405F]" />
              </a>
              <a 
                href="https://www.facebook.com/ldce.ac.in/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center justify-center transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-[#1877F2]" />
              </a>
              <a 
                href="https://x.com/OfficialLDCE" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all hover:scale-110"
                aria-label="X (Twitter)"
              >
                <svg className="w-5 h-5 text-gray-900 dark:text-gray-100" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Developed by{' '}
              <Link
                href="/developer"
                className="text-orange-600 dark:text-orange-400 font-medium hover:text-orange-700 dark:hover:text-orange-300 transition-colors underline-offset-4 hover:underline"
              >
                Vishvarajsinh Zala
              </Link>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">IT LDCE'27</p>
            <div className="flex items-center gap-2">
              <a 
                href="https://www.linkedin.com/in/vishvarajsinh-zala" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-7 h-7 rounded bg-gray-200 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center justify-center transition-all hover:scale-110"
                aria-label="Designer LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
              </a>
              <a 
                href="https://www.instagram.com/vishvarajsinh__0007" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-7 h-7 rounded bg-pink-50 dark:bg-pink-950/40 border border-pink-100 dark:border-pink-800/50 hover:bg-pink-100 dark:hover:bg-pink-900/60 flex items-center justify-center transition-all hover:scale-110"
                aria-label="Designer Instagram"
              >
                <Instagram className="w-3.5 h-3.5 text-[#E4405F]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
