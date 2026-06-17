"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Users, Building2, School } from 'lucide-react'
import Image from 'next/image'
import { COLLEGE_LOGOS } from '@/lib/colleges'

type Vacancy = {
  id: number
  college: string
  department: string
  visitingFaculty: number
}

export default function VacancyPage() {
  const showVacancy = false
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/vacancies')
      .then((r) => r.json())
      .then((data) => setVacancies(data.vacancies || []))
      .finally(() => setLoading(false))
  }, [])

  if (!showVacancy) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Group vacancies by college
  const vacanciesByCollege = vacancies.reduce((acc, vacancy) => {
    if (!acc[vacancy.college]) {
      acc[vacancy.college] = []
    }
    acc[vacancy.college].push(vacancy)
    return acc
  }, {} as Record<string, Vacancy[]>)

  const totalVisiting = vacancies.reduce((sum, v) => sum + v.visitingFaculty, 0)
  const totalColleges = Object.keys(vacanciesByCollege).length

  return (
    <div className="gradient-bg min-h-screen py-12">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
            Current Vacancies
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Gujarat's Government Engineering Colleges - Visiting Faculty Openings
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Colleges</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalColleges}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-600 rounded-xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Departments</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{vacancies.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Visiting Faculty</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalVisiting}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Vacancies Grouped by College */}
        {vacancies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card text-center py-12"
          >
            <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No vacancies available at the moment</p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {Object.entries(vacanciesByCollege).map(([college, collegeVacancies], collegeIndex) => {
              return (
                <motion.div
                  key={college}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + collegeIndex * 0.1 }}
                  className="card"
                >
                  {/* College Header */}
                  <div className="mb-6 pb-4 border-b-2 border-primary-200 dark:border-primary-800 flex items-center gap-4">
                    {COLLEGE_LOGOS[college] && (
                      <div className="w-16 h-16 rounded-lg bg-white dark:bg-gray-800 p-0.5 flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-700">
                        <Image
                          src={COLLEGE_LOGOS[college]}
                          alt={`${college} logo`}
                          width={64}
                          height={64}
                          className="object-contain"
                        />
                      </div>
                    )}
                    <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                      {college}
                    </h2>
                  </div>

                  {/* Department Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                          <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Department</th>
                          <th className="text-center p-4 font-semibold text-gray-700 dark:text-gray-300">Visiting Faculty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {collegeVacancies.map((vacancy, index) => (
                          <motion.tr
                            key={vacancy.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.05 * index }}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{vacancy.department}</td>
                            <td className="p-4 text-center">
                              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-semibold">
                                {vacancy.visitingFaculty}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
