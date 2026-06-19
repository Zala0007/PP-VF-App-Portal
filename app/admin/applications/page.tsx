"use client"
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, CheckCircle, XCircle, Calendar, Users, ArrowLeft, Search, Mail } from 'lucide-react'
import Link from 'next/link'
import { buildCandidateStatusEmailDraft, isCandidateStatus, type InterviewDetails } from '@/lib/candidateStatusEmail'
import InterviewDetailsModal from '@/components/InterviewDetailsModal'

type AppRow = {
  applicationId: string
  name: string
  email?: string
  department?: string[] | string
  timeSlotPeriod?: string
  dateTimeOfSubmit?: string
  reviewed?: boolean
  selectionStatus?: string
}

type ViewerRole = 'admin' | 'hod'

export default function ApplicationsList() {
  const [items, setItems] = useState<AppRow[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('')
  const [viewerRole, setViewerRole] = useState<ViewerRole | null>(null)
  const [interviewCandidate, setInterviewCandidate] = useState<AppRow | null>(null)

  const fetchApplications = () => {
    const adminToken = sessionStorage.getItem('admin_token')
    const hodToken = sessionStorage.getItem('hod_token')
    const headers: Record<string, string> = adminToken
      ? { 'x-admin-token': adminToken }
      : { 'x-hod-token': hodToken || '' }

    fetch('/api/applications?page=1&take=200', { headers })
      .then((r) => r.json())
      .then((json) => {
        setItems(json.items || [])
      })
      .finally(() => setLoading(false))
  }

  // Check if user is authenticated
  useEffect(() => {
    const adminToken = sessionStorage.getItem('admin_token')
    const hodToken = sessionStorage.getItem('hod_token')

    if (adminToken) {
      setViewerRole('admin')
      return
    }

    if (hodToken) {
      setViewerRole('hod')
      return
    }

    if (!adminToken && !hodToken) {
      window.location.href = '/admin'
    }
  }, [])

  useEffect(() => {
    fetchApplications()

    const refreshApplications = () => fetchApplications()
    window.addEventListener('focus', refreshApplications)
    const intervalId = window.setInterval(refreshApplications, 15000)

    return () => {
      window.removeEventListener('focus', refreshApplications)
      window.clearInterval(intervalId)
    }
  }, [])

  const toggleReviewed = async (applicationId: string, currentStatus: boolean) => {
    setUpdating(applicationId)
    const adminToken = sessionStorage.getItem('admin_token')
    const hodToken = sessionStorage.getItem('hod_token')
    const headers: Record<string, string> = adminToken
      ? { 'Content-Type': 'application/json', 'x-admin-token': adminToken }
      : { 'Content-Type': 'application/json', 'x-hod-token': hodToken || '' }
    
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers,
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

  function parseDepartments(value?: string[] | string) {
    if (!value) return []
    if (Array.isArray(value)) return value

    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string')
      }
    } catch {
      // Keep plain text department values as-is.
    }

    return [value]
  }

  const updateSelectionStatus = async (item: AppRow, selectionStatus: string, interviewDetails?: InterviewDetails) => {
    if (!selectionStatus) return
    if (!item.reviewed) return

    if (selectionStatus === 'Shortlisted for Interview' && !interviewDetails) {
      setInterviewCandidate(item)
      return
    }

    const emailWindow = item.email && isCandidateStatus(selectionStatus)
      ? window.open('', '_blank')
      : null

    setUpdating(item.applicationId)
    const adminToken = sessionStorage.getItem('admin_token')
    const hodToken = sessionStorage.getItem('hod_token')
    const headers: Record<string, string> = adminToken
      ? { 'Content-Type': 'application/json', 'x-admin-token': adminToken }
      : { 'Content-Type': 'application/json', 'x-hod-token': hodToken || '' }

    try {
      const response = await fetch(`/api/applications/${item.applicationId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ selectionStatus })
      })

      if (response.ok) {
        const result = await response.json()
        setItems(items.map(currentItem =>
          currentItem.applicationId === item.applicationId ? { ...currentItem, selectionStatus } : currentItem
        ))

        if (emailWindow && item.email && isCandidateStatus(selectionStatus)) {
          const draft = buildCandidateStatusEmailDraft({
            name: item.name,
            applicationId: item.applicationId,
            email: item.email,
            senderEmail: result.senderEmail,
            department: result.statusDepartment || formatDepartment(item.department),
            status: selectionStatus,
            interviewDetails
          })
          emailWindow.location.href = draft.gmailComposeUrl
        }
      } else {
        const result = await response.json().catch(() => null)
        emailWindow?.close()
        alert(result?.error || 'Failed to update selection status')
      }
    } catch (error) {
      emailWindow?.close()
      console.error('Error updating selection status:', error)
    } finally {
      setUpdating(null)
    }
  }

  function formatDepartment(value?: string[] | string) {
    const departments = parseDepartments(value)
    return departments.length > 0 ? departments.join(', ') : '—'
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
  // Filter items based on search query and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.applicationId && item.applicationId.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesDepartment = !filterDepartment || parseDepartments(item.department).includes(filterDepartment)
    return matchesSearch && matchesDepartment
  })

  // Get unique values for filter dropdowns
  const departments = Array.from(new Set(items.flatMap(item => parseDepartments(item.department)))).sort()

  return (
    <div className="gradient-bg min-h-screen">
      {interviewCandidate && (
        <InterviewDetailsModal
          candidateName={interviewCandidate.name}
          onCancel={() => setInterviewCandidate(null)}
          onConfirm={(details) => {
            const candidate = interviewCandidate
            setInterviewCandidate(null)
            void updateSelectionStatus(candidate, 'Shortlisted for Interview', details)
          }}
        />
      )}
      <div className="container-custom py-8">
      {/* Back and Email Management Buttons */}
      <div className="mb-6 flex justify-between items-center">
        <Link href={viewerRole === 'hod' ? '/hod' : '/admin'}>
          <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to {viewerRole === 'hod' ? 'HOD Dashboard' : 'Admin Dashboard'}
          </button>
        </Link>
        {viewerRole === 'admin' && (
          <Link href="/admin/principal-emails">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Mail className="w-5 h-5" />
              Manage Principal Emails
            </button>
          </Link>
        )}
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
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
              >
                <option value="">All Departments</option>
                {departments.map(department => (
                  <option key={department} value={department}>{department}</option>
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
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Department</th>
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Submitted</th>
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400">
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
                  <td className="p-4 text-gray-600 dark:text-gray-400">
                    {formatDepartment(item.department)}
                  </td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                    {item.dateTimeOfSubmit ? new Date(item.dateTimeOfSubmit).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => toggleReviewed(item.applicationId, item.reviewed || false)}
                        disabled={updating === item.applicationId}
                        className={`flex w-fit items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all ${
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
                      <span className={`w-fit px-3 py-1 rounded-full text-xs font-semibold ${
                        item.selectionStatus === 'Shortlisted for Interview'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : item.selectionStatus === 'Selected'
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : item.selectionStatus === 'Rejected'
                            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}>
                        {item.selectionStatus || 'Pending'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
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
                      <select
                        value={
                          item.selectionStatus === 'Shortlisted for Interview' ||
                          item.selectionStatus === 'Rejected' ||
                          item.selectionStatus === 'Selected'
                            ? item.selectionStatus
                            : ''
                        }
                        onChange={(event) => updateSelectionStatus(item, event.target.value)}
                        disabled={updating === item.applicationId || !item.reviewed}
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-900 dark:text-gray-100 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Update selection status for ${item.name}`}
                        title={item.reviewed ? 'Update selection status' : 'Mark as reviewed to update selection status'}
                      >
                        <option value="">Select status</option>
                        <option value="Shortlisted for Interview">Shortlisted for Interview</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Selected">Selected</option>
                      </select>
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
