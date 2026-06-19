"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Calendar, FileText, ExternalLink, FileCheck, Download } from 'lucide-react'
import Link from 'next/link'

interface Resource {
  id: number
  title: string
  filePath: string
}

const resources = [
  {
    title: 'GTU Syllabus',
    description: 'Access the latest GTU syllabus for all engineering courses and programs.',
    icon: BookOpen,
    href: 'https://gtu.ac.in/syllabus/syllabus.aspx',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  {
    title: 'Academic Calendar',
    description: 'View important dates, examination schedules, and academic events.',
    icon: Calendar,
    href: 'https://www.gtu.ac.in/AcademicCal.aspx',
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800'
  }
]

export default function ResourcesPage() {
  const [pdfResources, setPdfResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPdfResources()
  }, [])

  const fetchPdfResources = async () => {
    try {
      const response = await fetch('/api/resources')
      if (response.ok) {
        const data = await response.json()
        setPdfResources(data)
      }
    } catch (error) {
      console.error('Error fetching PDF resources:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gradient-bg min-h-screen py-12">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Resources
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Access important academic resources, forms, and information for visiting faculty members
          </p>
        </motion.div>

        <div className="flex flex-col">
        {/* Resources Grid */}
        <div className="order-2 mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {resources.map((resource, index) => {
            const Icon = resource.icon
            const isExternal = resource.href.startsWith('http')
            
            return (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={resource.href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="block h-full"
                >
                  <div className={`card group flex h-full cursor-pointer flex-col border-2 bg-gradient-to-br ${resource.bgGradient} ${resource.borderColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
                    {/* Icon */}
                    <div className="mb-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${resource.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100 flex items-center gap-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {resource.title}
                        {isExternal && (
                          <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {resource.description}
                      </p>
                    </div>

                    {/* Hover Effect */}
                    <div className={`mt-4 pt-4 border-t ${resource.borderColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <span className="text-sm font-medium bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                        {isExternal ? 'Visit Resource →' : 'View Details →'}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Norms and Remuneration PDFs Section */}
        {pdfResources.length > 0 && (
          <motion.div
            id="norms-remuneration"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="order-1 mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 text-center">
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Notice and Circular
              </span>
            </h2>
            <div className="grid gap-4">
              {pdfResources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="card bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border-2 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                          {resource.title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={resource.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FileCheck className="w-4 h-4" />
                        View
                      </a>
                      <a
                        href={resource.filePath}
                        download
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 card bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/10 dark:to-accent-900/10 border-2 border-primary-200 dark:border-primary-800"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-600 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">Need Help?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you need assistance with any resources or have questions about the visiting faculty program, 
                please contact the administration office.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                
                <a href="mailto:adminofficer@ldce.ac.in" className="text-primary-600 dark:text-primary-400 hover:underline">
                  📧 adminofficer@ldce.ac.in
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
