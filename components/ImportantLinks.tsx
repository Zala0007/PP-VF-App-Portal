"use client"

import { motion } from 'framer-motion'
import { FileText, BookOpen, Calendar, Building2, DollarSign, ExternalLink } from 'lucide-react'

const links = [
  { title: 'Norms and Remuneration Details', href: '/docs/norms', icon: DollarSign },
  { title: 'LDCE Departments', href: '/docs/departments', icon: Building2 },
  { title: 'GTU Syllabus', href: '/docs/gtu-syllabus', icon: BookOpen },
  { title: 'Academic Calendar', href: '/docs/calendar', icon: Calendar }
]

export default function ImportantLinks() {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
      {links.map((link, index) => (
        <motion.a
          key={link.href}
          href={link.href}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5 }}
          className="card card-hover flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300">
            <link.icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
              {link.title}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">View Details</div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
        </motion.a>
      ))}
    </div>
  )
}
