"use client"

import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { COLLEGE_WEBSITES, COLLEGE_LOGOS } from '@/lib/colleges'

export default function CollegesPage() {
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
              L.D. College of Engineering
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Established in 1948 | Ahmedabad, Gujarat
          </p>
        </motion.div>

        {/* College Card */}
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <a
              href={COLLEGE_WEBSITES['L.D. College of Engineering, Ahmedabad']}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="glass-card p-8 h-full border-2 border-transparent transition-all duration-300 hover:shadow-xl">
                <div className="flex flex-col items-center gap-6 text-center">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src={COLLEGE_LOGOS['L.D. College of Engineering, Ahmedabad']}
                      alt="L.D. College of Engineering, Ahmedabad logo"
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      L.D. College of Engineering, Ahmedabad
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      One of Gujarat's premier engineering institutions with a legacy of excellence in education and innovation.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 group-hover:underline font-semibold">
                      <span>Visit Website</span>
                      <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </motion.div>
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
