"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle, Eye, FileDown, LogOut, Mail, Search, Users, XCircle } from 'lucide-react'
import Link from 'next/link'
import { buildCandidateStatusEmailDraft, isCandidateStatus, type InterviewDetails } from '@/lib/candidateStatusEmail'
import InterviewDetailsModal from '@/components/InterviewDetailsModal'

type AppRow = {
  applicationId: string
  name: string
  email?: string
  department?: string[] | string
  preferredSubjects?: string
  resumeFile?: string
  dateTimeOfSubmit?: string
  reviewed?: boolean
  selectionStatus?: string
  statusDepartment?: string
}

export default function HodDashboard() {
  const [items, setItems] = useState<AppRow[]>([])
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [interviewCandidate, setInterviewCandidate] = useState<AppRow | null>(null)
  const [exportingApplications, setExportingApplications] = useState(false)
  const [exportingSelected, setExportingSelected] = useState(false)

  useEffect(() => {
    const token = sessionStorage.getItem('hod_token')
    const storedDepartment = sessionStorage.getItem('hod_department')

    if (!token) {
      window.location.href = '/admin'
      return
    }

    if (storedDepartment) {
      setDepartment(storedDepartment)
    }

    fetch('/api/hod/applications', {
      headers: { 'x-hod-token': token }
    })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load HOD dashboard')
        }

        setItems(data.items || [])
        setDepartment(data.department || storedDepartment || '')
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load HOD dashboard')
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return items.filter((item) => {
      const matchesSearch = (
        item.name.toLowerCase().includes(query) ||
        item.applicationId.toLowerCase().includes(query)
      )

      return matchesSearch
    })
  }, [items, searchQuery])

  const reviewedCount = items.filter((item) => item.reviewed).length
  const pendingCount = items.length - reviewedCount

  function handleLogout() {
    sessionStorage.removeItem('hod_token')
    sessionStorage.removeItem('hod_department')
    window.location.href = '/admin'
  }

  async function downloadDepartmentExport(
    url: string,
    fallbackFilename: string,
    setExporting: (value: boolean) => void
  ) {
    const token = sessionStorage.getItem('hod_token')
    setExporting(true)

    try {
      const response = await fetch(url, {
        headers: { 'x-hod-token': token || '' }
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error || 'Failed to download file')
      }

      const blob = await response.blob()
      const disposition = response.headers.get('Content-Disposition') || ''
      const filenameMatch = disposition.match(/filename=\"?([^\";]+)\"?/i)
      const objectUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filenameMatch?.[1] || fallbackFilename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(objectUrl)
    } catch (error: any) {
      alert(error.message || 'Failed to download file')
    } finally {
      setExporting(false)
    }
  }

  function getRowKey(item: AppRow) {
    return `${item.applicationId}::${item.statusDepartment || ''}`
  }

  async function toggleReviewed(item: AppRow) {
    const rowKey = getRowKey(item)
    setUpdating(rowKey)
    const token = sessionStorage.getItem('hod_token')

    try {
      const response = await fetch(`/api/hod/applications/${item.applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-hod-token': token || ''
        },
        body: JSON.stringify({
          reviewed: !item.reviewed,
          statusDepartment: item.statusDepartment
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status')
      }

      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.applicationId === item.applicationId &&
          currentItem.statusDepartment === item.statusDepartment
            ? {
                ...currentItem,
                reviewed: result.reviewed,
                selectionStatus: result.selectionStatus
              }
            : currentItem
        )
      )
    } catch (err: any) {
      alert(err.message || 'Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  async function updateSelectionStatus(item: AppRow, selectionStatus: string, interviewDetails?: InterviewDetails) {
    if (!selectionStatus) return
    if (!item.reviewed) return

    if (selectionStatus === 'Shortlisted for Interview' && !interviewDetails) {
      setInterviewCandidate(item)
      return
    }

    const emailWindow = item.email && isCandidateStatus(selectionStatus)
      ? window.open('', '_blank')
      : null

    const rowKey = getRowKey(item)
    setUpdating(rowKey)
    const token = sessionStorage.getItem('hod_token')

    try {
      const response = await fetch(`/api/hod/applications/${item.applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-hod-token': token || ''
        },
        body: JSON.stringify({
          selectionStatus,
          statusDepartment: item.statusDepartment
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update selection status')
      }

      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.applicationId === item.applicationId
          && currentItem.statusDepartment === item.statusDepartment
            ? { ...currentItem, selectionStatus: result.selectionStatus }
            : currentItem
        )
      )

      if (emailWindow && item.email && isCandidateStatus(result.selectionStatus)) {
        const draft = buildCandidateStatusEmailDraft({
          name: item.name,
          applicationId: item.applicationId,
          email: item.email,
          senderEmail: result.senderEmail,
          department: result.statusDepartment,
          status: result.selectionStatus,
          interviewDetails
        })
        emailWindow.location.href = draft.gmailComposeUrl
      }
    } catch (err: any) {
      emailWindow?.close()
      alert(err.message || 'Failed to update selection status')
    } finally {
      setUpdating(null)
    }
  }

  function formatDepartment(value?: string[] | string) {
    if (!value) return '-'
    if (Array.isArray(value)) return value.join(', ')

    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.join(', ')
    } catch {
      // Keep plain text department values as-is.
    }

    return value
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="gradient-bg min-h-screen py-12">
        <div className="container-custom">
          <div className="card max-w-xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Access Error</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Link href="/admin" className="btn-primary inline-flex">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    { label: 'Department Applications', value: items.length, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Reviewed', value: reviewedCount, icon: CheckCircle, color: 'from-green-500 to-green-600' },
    { label: 'Pending Review', value: pendingCount, icon: Calendar, color: 'from-amber-500 to-amber-600' }
  ]

  return (
    <div className="gradient-bg min-h-screen py-12">
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
      <div className="container-custom">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-1">LDCE HOD Dashboard</p>
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">
              {department}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Department-wise visiting faculty applications
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                downloadDepartmentExport(
                  '/api/hod/export-applications',
                  'Department_Applications.xlsx',
                  setExportingApplications
                )
              }
              disabled={exportingApplications}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-medium disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              {exportingApplications ? 'Preparing...' : 'Download All Details'}
            </button>
            <button
              type="button"
              onClick={() =>
                downloadDepartmentExport(
                  '/api/hod/export-selected-candidates',
                  'Department_Selected_Candidates.xlsx',
                  setExportingSelected
                )
              }
              disabled={exportingSelected}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors font-medium disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              {exportingSelected ? 'Preparing...' : 'Download Selected'}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">All Applications</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Name/Application ID</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
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
                      key={getRowKey(item)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="p-4 text-sm font-mono text-gray-600 dark:text-gray-400">{item.applicationId}</td>
                      <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{item.name}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">
                        {formatDepartment(item.department)}
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        {item.dateTimeOfSubmit ? new Date(item.dateTimeOfSubmit).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => toggleReviewed(item)}
                            disabled={updating === getRowKey(item)}
                            className={`inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                            item.reviewed
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
                              : 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800'
                          } ${updating === getRowKey(item) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {updating === getRowKey(item) ? (
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
                            disabled={updating === getRowKey(item) || !item.reviewed}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
