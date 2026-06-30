"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, LogIn, FileText, Users, Clock, CheckCircle, Eye, LogOut, Building2, FileUp, FileDown, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminIndex() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exportingAll, setExportingAll] = useState(false)
  const [exportingSelected, setExportingSelected] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    active: 0,
    selected: 0,
    rejected: 0,
    visitingFaculty: 0,
    totalColleges: 0,
  })

  useEffect(() => {
    const t = sessionStorage.getItem('admin_token')
    if (t) {
      setAuthenticated(true)
      fetchStats(t)
      return
    }

    const hodToken = sessionStorage.getItem('hod_token')
    if (hodToken) {
      router.push('/hod')
    }
  }, [router])

  useEffect(() => {
    if (!authenticated) return

    const refreshStats = () => {
      const token = sessionStorage.getItem('admin_token')
      if (token) fetchStats(token)
    }

    window.addEventListener('focus', refreshStats)
    const intervalId = window.setInterval(refreshStats, 15000)

    return () => {
      window.removeEventListener('focus', refreshStats)
      window.clearInterval(intervalId)
    }
  }, [authenticated])

  async function fetchStats(token: string) {
    try {
      const [appsRes, vacanciesRes] = await Promise.all([
        fetch('/api/applications', { headers: { 'x-admin-token': token } }),
        fetch('/api/vacancies')
      ])
      
      if (appsRes.ok) {
        const data = await appsRes.json()
        const applicationStats = data.stats || {
          total: data.count || 0,
          pending: 0,
          reviewed: 0,
          selected: 0,
          rejected: 0,
        }
        
        let totalVF = 0
        let colleges = 0
        
        if (vacanciesRes.ok) {
          const vacanciesData = await vacanciesRes.json()
          const vacancies = vacanciesData.vacancies || []
          
          console.log('Vacancies data:', vacancies)
          
          totalVF = vacancies.reduce((sum: number, v: any) => sum + (v.visitingFaculty || 0), 0)
          
          // Count unique colleges
          const uniqueColleges = new Set(vacancies.map((v: any) => v.college))
          colleges = uniqueColleges.size
          
          console.log('Total VF:', totalVF)
        }
        
        setStats({
          total: applicationStats.total,
          pending: applicationStats.pending,
          approved: applicationStats.reviewed,
          active: applicationStats.reviewed,
          selected: applicationStats.selected,
          rejected: applicationStats.rejected,
          visitingFaculty: totalVF,
          totalColleges: colleges,
        })
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Invalid password. Please try again.')
      }

      if (result.role === 'admin') {
        sessionStorage.removeItem('hod_token')
        sessionStorage.removeItem('hod_department')
        sessionStorage.setItem('admin_token', password)
        setAuthenticated(true)
        fetchStats(password)
        return
      }

      if (result.role === 'hod') {
        sessionStorage.removeItem('admin_token')
        sessionStorage.setItem('hod_token', password)
        sessionStorage.setItem('hod_department', result.department)
        router.push('/hod')
        return
      }

      throw new Error('Invalid password. Please try again.')
    } catch (err: any) {
      setError(err.message || 'Invalid password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_token')
    sessionStorage.removeItem('hod_token')
    sessionStorage.removeItem('hod_department')
    setAuthenticated(false)
    setPassword('')
    setStats({
      total: 0,
      pending: 0,
      approved: 0,
      active: 0,
      selected: 0,
      rejected: 0,
      visitingFaculty: 0,
      totalColleges: 0,
    })
  }

  async function handleDownloadSelectedCandidates() {
    const token = sessionStorage.getItem('admin_token')

    if (!token) {
      setAuthenticated(false)
      return
    }

    setExportingSelected(true)

    try {
      const response = await fetch('/api/export-selected-candidates', {
        headers: { 'x-admin-token': token }
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error || 'Failed to download selected candidates')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Selected_Candidates_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch (err: any) {
      alert(err.message || 'Failed to download selected candidates')
    } finally {
      setExportingSelected(false)
    }
  }

  async function handleDownloadAllApplications() {
    const token = sessionStorage.getItem('admin_token')

    if (!token) {
      setAuthenticated(false)
      return
    }

    setExportingAll(true)

    try {
      const response = await fetch('/api/export-all-applications', {
        headers: { 'x-admin-token': token }
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error || 'Failed to download applications')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `All_Applications_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch (err: any) {
      alert(err.message || 'Failed to download applications')
    } finally {
      setExportingAll(false)
    }
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
                Enter your password to access the admin or HOD dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="label-field">Password</label>
                <input
                  suppressHydrationWarning
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
                suppressHydrationWarning
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

  const showVacancy = false

  const statsData = [
    { icon: FileText, label: 'Total Applications', value: stats.total.toString(), color: 'from-blue-500 to-blue-600' },
    { icon: Clock, label: 'Pending Department Reviews', value: stats.pending.toString(), color: 'from-amber-500 to-amber-600' },
    { icon: CheckCircle, label: 'Reviewed Department Decisions', value: stats.approved.toString(), color: 'from-green-500 to-green-600' },
    { icon: Users, label: 'Selected Department Decisions', value: stats.selected.toString(), color: 'from-emerald-500 to-emerald-600' },
    { icon: XCircle, label: 'Rejected Department Decisions', value: stats.rejected.toString(), color: 'from-red-500 to-red-600' },
    ...(showVacancy
      ? [
          { icon: Users, label: 'Visiting Faculty', value: stats.visitingFaculty.toString(), color: 'from-pink-500 to-pink-600' }
        ]
      : [])
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + quickLinks.length * 0.1 }}
              >
                <button
                  type="button"
                  onClick={handleDownloadAllApplications}
                  disabled={exportingAll}
                  className="card card-hover group w-full text-left disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300">
                      <FileDown className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {exportingAll ? 'Preparing Download...' : 'Download All Applications'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Export every application currently present in the portal
                      </p>
                    </div>
                  </div>
                </button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + quickLinks.length * 0.1 }}
              >
                <button
                  type="button"
                  onClick={handleDownloadSelectedCandidates}
                  disabled={exportingSelected}
                  className="card card-hover group w-full text-left disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300">
                      <FileDown className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {exportingSelected ? 'Preparing Download...' : 'Download Selected Candidates'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Export selected candidates from all departments
                      </p>
                    </div>
                  </div>
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
