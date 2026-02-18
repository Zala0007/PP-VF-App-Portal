"use client"
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, CheckCircle, XCircle, Calendar, Users, ArrowLeft, Search, Mail, Download } from 'lucide-react'
import Link from 'next/link'

type AppRow = {
  applicationId: string
  name: string
  email?: string
  applicationType: string
  college?: string
  department?: string
  timeSlotPeriod?: string
  dateTimeOfSubmit?: string
  reviewed?: boolean
}

export default function ApplicationsList() {
  const [items, setItems] = useState<AppRow[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCollege, setFilterCollege] = useState('')
  const [exportingExcel, setExportingExcel] = useState(false)

  const fetchApplications = () => {
    const token = sessionStorage.getItem('admin_token')
    fetch('/api/applications?page=1&take=200', { headers: { 'x-admin-token': token || '' } })
      .then((r) => r.json())
      .then((json) => {
        setItems(json.items || [])
      })
      .finally(() => setLoading(false))
  }

  // Check if user is authenticated
  useEffect(() => {
    const token = sessionStorage.getItem('admin_token')
    if (!token) {
      window.location.href = '/admin'
    }
  }, [])

  useEffect(() => {
    fetchApplications()
  }, [])

  const toggleReviewed = async (applicationId: string, currentStatus: boolean) => {
    setUpdating(applicationId)
    const token = sessionStorage.getItem('admin_token')
    
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token || ''
        },
        body: JSON.stringify({ reviewed: !currentStatus })
      })

      if (response.ok) {
        setItems(items.map(item => 
          item.applicationId === applicationId ? { ...item, reviewed: !currentStatus } : item
        ))
      }
    } catch (error) {
      console.error('Error updating review status:', error)
    } finally {
      setUpdating(null)
    }
  }

  const handleExportToExcel = async () => {
    if (!filterCollege) {
      alert('Please select a college first to export applications')
      return
    }

    setExportingExcel(true)
    try {
      const response = await fetch('/api/export-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ college: filterCollege })
      })

      if (!response.ok) {
        throw new Error('Failed to generate Excel file')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const safeCollegeName = filterCollege.replace(/[^a-zA-Z0-9]/g, '_')
      a.download = `Applications_${safeCollegeName}_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('Failed to export applications to Excel')
    } finally {
      setExportingExcel(false)
    }
  }

  const handleEmailExcel = async () => {
    if (!filterCollege) {
      alert('Please select a college first to export applications')
      return
    }

    if (!confirm(`Send Excel file with applications to the principal of ${filterCollege}?`)) {
      return
    }

    setExportingExcel(true)
    try {
      const response = await fetch('/api/email-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ college: filterCollege })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email')
      }

      alert(`Email sent successfully to ${result.recipientEmail} with ${result.applicationCount} applications!`)
    } catch (error: any) {
      console.error('Error sending email:', error)
      alert(error.message || 'Failed to send email with Excel attachment')
    } finally {
      setExportingExcel(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const reviewedCount = items.filter(item => item.reviewed).length
  const pendingCount = items.length - reviewedCount
  const professorInPracticeCount = items.filter(item => item.applicationType === 'Professor in Practice').length
  const visitingFacultyCount = items.filter(item => item.applicationType === 'Visiting Faculty').length

  // Filter items based on search query and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.applicationId && item.applicationId.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = !filterType || item.applicationType === filterType
    const matchesCollege = !filterCollege || item.college === filterCollege
    return matchesSearch && matchesType && matchesCollege
  })

  // Get unique values for filter dropdowns
  const applicationTypes = Array.from(new Set(items.map(item => item.applicationType)))
  const colleges = Array.from(new Set(items.map(item => item.college).filter(Boolean)))

  return (
    <div className="gradient-bg min-h-screen">
      <div className="container-custom py-8">
      {/* Back and Email Management Buttons */}
      <div className="mb-6 flex justify-between items-center">
        <Link href="/admin">
          <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Admin Dashboard
          </button>
        </Link>
        <Link href="/admin/principal-emails">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Mail className="w-5 h-5" />
            Manage Principal Emails
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-600 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{items.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-600 rounded-xl">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Reviewed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{reviewedCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-600 rounded-xl">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{pendingCount}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">All Applications</h2>
            {filterCollege && (
              <div className="flex gap-2">
                <button
                  onClick={handleExportToExcel}
                  disabled={exportingExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                  <Download className="w-5 h-5" />
                  {exportingExcel ? 'Generating...' : 'Download Excel'}
                </button>
                <button
                  onClick={handleEmailExcel}
                  disabled={exportingExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  <Mail className="w-5 h-5" />
                  {exportingExcel ? 'Sending...' : 'Send Email with Excel'}
                </button>
              </div>
            )}
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Application Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
              >
                <option value="">All Types</option>
                {applicationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">College</label>
              <select
                value={filterCollege}
                onChange={(e) => setFilterCollege(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
              >
                <option value="">All Colleges</option>
                {colleges.map(college => (
                  <option key={college} value={college}>{college}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Name/Application ID</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Application ID</th>
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Type</th>
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">College</th>
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Department</th>
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Submitted</th>
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No applications found matching "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                  <motion.tr
                  key={item.applicationId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="p-4 text-sm font-mono text-gray-600 dark:text-gray-400">
                    {item.applicationId}
                  </td>
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-sm">
                      {item.applicationType}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">
                    {item.college || '—'}
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">
                    {item.department ? (
                      Array.isArray(item.department) 
                        ? item.department.join(', ')
                        : typeof item.department === 'string' && item.department.startsWith('[')
                          ? JSON.parse(item.department).join(', ')
                          : item.department
                    ) : '—'}
                  </td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                    {item.dateTimeOfSubmit ? new Date(item.dateTimeOfSubmit).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleReviewed(item.applicationId, item.reviewed || false)}
                      disabled={updating === item.applicationId}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        item.reviewed
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                          : 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800'
                      } ${updating === item.applicationId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {updating === item.applicationId ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : item.reviewed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      {item.reviewed ? 'Reviewed' : 'Pending'}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/applications/${item.applicationId}`}
                        className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>
                      {item.email && (
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(item.email)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                          title={`Send email to ${item.email}`}
                        >
                          <Mail className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </td>
                </motion.tr>
              )))}
            </tbody>
          </table>
        </div>
      </motion.div>
      </div>
    </div>
  )
}
