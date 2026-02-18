"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, LogIn, FileText, Users, Clock, CheckCircle, Eye, LogOut, Briefcase, Building2, FileUp } from 'lucide-react'
import Link from 'next/link'

export default function AdminIndex() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    active: 0,
    professorInPractice: 0,
    visitingFaculty: 0,
    totalColleges: 0,
    totalDepartments: 0
  })

  useEffect(() => {
    const t = sessionStorage.getItem('admin_token')
    if (t) {
      setAuthenticated(true)
      fetchStats(t)
    }
  }, [])

  async function fetchStats(token: string) {
    try {
      const [appsRes, vacanciesRes] = await Promise.all([
        fetch('/api/applications', { headers: { 'x-admin-token': token } }),
        fetch('/api/vacancies')
      ])
      
      if (appsRes.ok) {
        const data = await appsRes.json()
        const applications = data.items || []
        
        let totalPIP = 0
        let totalVF = 0
        let colleges = 0
        let departments = 0
        
        if (vacanciesRes.ok) {
          const vacanciesData = await vacanciesRes.json()
          const vacancies = vacanciesData.vacancies || []
          
          console.log('Vacancies data:', vacancies)
          
          totalPIP = vacancies.reduce((sum: number, v: any) => sum + (v.professorInPractice || 0), 0)
          totalVF = vacancies.reduce((sum: number, v: any) => sum + (v.visitingFaculty || 0), 0)
          
          // Count unique colleges
          const uniqueColleges = new Set(vacancies.map((v: any) => v.college))
          colleges = uniqueColleges.size
          departments = vacancies.length
          
          console.log('Total PIP:', totalPIP, 'Total VF:', totalVF)
        }
        
        setStats({
          total: applications.length,
          pending: applications.filter((app: any) => !app.reviewed).length,
          approved: applications.filter((app: any) => app.reviewed).length,
          active: applications.filter((app: any) => app.reviewed).length,
          professorInPractice: totalPIP,
          visitingFaculty: totalVF,
          totalColleges: colleges,
          totalDepartments: departments
        })
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const validPasswords = (process.env.NEXT_PUBLIC_ADMIN_PASSWORDS || 'changeme').split(',')
    
    setTimeout(() => {
      if (validPasswords.includes(password)) {
        sessionStorage.setItem('admin_token', password)
        setAuthenticated(true)
        fetchStats(password)
      } else {
        setError('Invalid password. Please try again.')
      }
      setLoading(false)
    }, 500)
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_token')
    setAuthenticated(false)
    setPassword('')
    setStats({
      total: 0,
      pending: 0,
      approved: 0,
      active: 0,
      professorInPractice: 0,
      visitingFaculty: 0,
      totalColleges: 0,
      totalDepartments: 0
    })
  }

  if (!authenticated) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container-custom max-w-md"
        >
          <div className="card">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent mb-2">
                Admin Login
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your password to access the admin dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="label-field">Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  type="password"
                  placeholder="Enter admin password"
                  required
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? (
                  'Signing in...'
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    )
  }

  const statsData = [
    { icon: FileText, label: 'Total Applications', value: stats.total.toString(), color: 'from-blue-500 to-blue-600' },
    { icon: Clock, label: 'Pending Review', value: stats.pending.toString(), color: 'from-amber-500 to-amber-600' },
    { icon: CheckCircle, label: 'Reviewed', value: stats.approved.toString(), color: 'from-green-500 to-green-600' },
    { icon: Building2, label: 'Colleges', value: stats.totalColleges.toString(), color: 'from-purple-500 to-purple-600' },
    { icon: Briefcase, label: 'Departments', value: stats.totalDepartments.toString(), color: 'from-indigo-500 to-indigo-600' },
    { icon: Users, label: 'Professor in Practice', value: stats.professorInPractice.toString(), color: 'from-orange-500 to-orange-600' },
    { icon: Users, label: 'Visiting Faculty', value: stats.visitingFaculty.toString(), color: 'from-pink-500 to-pink-600' }
  ]

  const quickLinks = [
    { 
      title: 'View All Applications', 
      href: '/admin/applications', 
      description: 'Browse and manage all submitted applications',
      icon: Eye,
      color: 'from-primary-500 to-accent-500'
    },
    { 
      title: 'Manage Vacancies', 
      href: '/admin/vacancy', 
      description: 'Update department-wise vacancy information',
      icon: Briefcase,
      color: 'from-green-500 to-emerald-500'
    },
    { 
      title: 'Manage Colleges & Departments', 
      href: '/admin/colleges', 
      description: 'Add or edit colleges and their departments',
      icon: Building2,
      color: 'from-blue-500 to-indigo-500'
    },
    { 
      title: 'Manage Resources', 
      href: '/admin/resources', 
      description: 'Upload and manage PDF resources for norms and remuneration',
      icon: FileUp,
      color: 'from-orange-500 to-amber-500'
    }
  ]

  return (
    <div className="gradient-bg min-h-screen py-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back! Here's an overview of the application portal
              </p>
            </div>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </motion.button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6 mb-4">
            {statsData.slice(0, 3).map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card card-hover"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.slice(3).map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 3) * 0.1 }}
                className="card card-hover"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Link href={link.href}>
                    <div className="card card-hover group">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300`}>
                          <link.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                            {link.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {link.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
