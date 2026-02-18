"use client"

import { motion } from 'framer-motion'
import { School, ExternalLink, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { GUJARAT_COLLEGES, COLLEGE_WEBSITES, COLLEGE_LOGOS } from '@/lib/colleges'

export default function CollegesPage() {
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-amber-500',
    'from-red-500 to-rose-500',
    'from-indigo-500 to-purple-500',
    'from-teal-500 to-cyan-500',
    'from-yellow-500 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-cyan-500 to-blue-500',
    'from-emerald-500 to-teal-500',
    'from-violet-500 to-purple-500',
    'from-fuchsia-500 to-pink-500',
    'from-sky-500 to-blue-500',
    'from-lime-500 to-green-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-yellow-500',
    'from-blue-600 to-indigo-600',
    'from-green-600 to-emerald-600'
  ]

  return (
    <div className="gradient-bg min-h-screen py-12">
      <div className="container-custom">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resources
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Gujarat's Government Engineering Colleges
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore Gujarat's Government Engineering Colleges and visit their Official Websites
          </p>
        </motion.div>

        {/* Colleges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GUJARAT_COLLEGES.map((college, index) => (
            <motion.div
              key={college}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <a
                href={COLLEGE_WEBSITES[college]}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="glass-card p-6 h-full border-2 border-transparent transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Image
                        src={COLLEGE_LOGOS[college]}
                        alt={`${college} logo`}
                        fill
                        className="object-contain p-0.5"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                        {college}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 group-hover:underline">
                        <span>Visit Website</span>
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
        </motion.div>
      </div>
    </div>
  )
}
