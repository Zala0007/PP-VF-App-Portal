"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Save, X, ArrowLeft, School, BookOpen } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { COLLEGE_LOGOS } from '@/lib/colleges'

type CollegeData = {
  name: string
  departments: string[]
}

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [editingCollege, setEditingCollege] = useState<string | null>(null)
  const [editingDepartments, setEditingDepartments] = useState<string[]>([])
  const [addingCollege, setAddingCollege] = useState(false)
  const [newCollege, setNewCollege] = useState({ name: '', departments: [''], logo: null as File | null })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token')
    fetch('/api/colleges', {
      headers: {
        'x-admin-token': token || ''
      }
    })
      .then((r) => r.json())
      .then((data) => setColleges(data.colleges || {}))
      .finally(() => setLoading(false))
  }, [])

  const handleSaveCollege = async (collegeName: string, departments: string[]) => {
    const token = sessionStorage.getItem('admin_token')
    const response = await fetch('/api/colleges', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-token': token || ''
      },
      body: JSON.stringify({ collegeName, departments: departments.filter(d => d.trim()) })
    })

    if (response.ok) {
      const data = await response.json()
      setColleges(data.colleges)
      setEditingCollege(null)
      setEditingDepartments([])
    }
  }

  const handleDeleteCollege = async (collegeName: string) => {
    if (!confirm(`Are you sure you want to delete ${collegeName}?`)) return
    
    const token = sessionStorage.getItem('admin_token')
    const response = await fetch('/api/colleges', {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-token': token || ''
      },
      body: JSON.stringify({ collegeName })
    })

    if (response.ok) {
      const data = await response.json()
      setColleges(data.colleges)
    }
  }

  const handleAddCollege = async () => {
    if (!newCollege.name.trim()) {
      alert('Please enter college name')
      return
    }
    const validDepts = newCollege.departments.filter(d => d.trim())
    if (validDepts.length === 0) {
      alert('Please add at least one department')
      return
    }
    if (!newCollege.logo) {
      alert('Please upload a college logo')
      return
    }

    // Upload logo first
    const formData = new FormData()
    formData.append('logo', newCollege.logo)
    formData.append('collegeName', newCollege.name)

    const token = sessionStorage.getItem('admin_token')
    const uploadResponse = await fetch('/api/colleges/upload-logo', {
      method: 'POST',
      headers: {
        'x-admin-token': token || ''
      },
      body: formData
    })

    if (!uploadResponse.ok) {
      alert('Failed to upload logo')
      return
    }

    await handleSaveCollege(newCollege.name, validDepts)
    setAddingCollege(false)
    setNewCollege({ name: '', departments: [''], logo: null })
    setLogoPreview(null)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        alert('Please upload only JPG or PNG images')
        return
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB')
        return
      }
      setNewCollege({ ...newCollege, logo: file })
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="gradient-bg min-h-screen">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin">
              <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-4">
                <ArrowLeft className="w-5 h-5" />
                Back to Admin Dashboard
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Manage Colleges & Departments
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add, edit, or remove colleges and their departments
            </p>
          </div>
          <button
            onClick={() => setAddingCollege(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add College
          </button>
        </div>

        {/* Add New College Form */}
        {addingCollege && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-6 bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <School className="w-5 h-5" />
                Add New College
              </h3>
              <button onClick={() => { setAddingCollege(false); setNewCollege({ name: '', departments: [''], logo: null }) }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">College Name *</label>
                <input
                  type="text"
                  value={newCollege.name}
                  onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="e.g., Government Engineering College, Ahmedabad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Departments *</label>
                {newCollege.departments.map((dept, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={dept}
                      onChange={(e) => {
                        const newDepts = [...newCollege.departments]
                        newDepts[idx] = e.target.value
                        setNewCollege({ ...newCollege, departments: newDepts })
                      }}
                      className="input-field flex-1"
                      placeholder="e.g., Computer Engineering"
                    />
                    {newCollege.departments.length > 1 && (
                      <button
                        onClick={() => setNewCollege({ 
                          ...newCollege, 
                          departments: newCollege.departments.filter((_, i) => i !== idx) 
                        })}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setNewCollege({ ...newCollege, departments: [...newCollege.departments, ''] })}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Department
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">College Logo * (JPG/PNG, max 2MB)</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleLogoChange}
                  className="input-field w-full"
                />
                {logoPreview && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-white border-2 border-gray-200">
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setAddingCollege(false); setNewCollege({ name: '', departments: [''], logo: null }); setLogoPreview(null) }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCollege}
                  className="btn-primary"
                >
                  Save College
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Colleges List */}
        <div className="grid grid-cols-1 gap-6">
          {Object.entries(colleges).length === 0 ? (
            <div className="card text-center py-12">
              <School className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No colleges added yet</p>
            </div>
          ) : (
            Object.entries(colleges).map(([collegeName, departments]) => (
              <motion.div
                key={collegeName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
                      <Image
                        src={COLLEGE_LOGOS[collegeName] || '/ldce-logo.png'}
                        alt={`${collegeName} logo`}
                        fill
                        className="object-contain p-0.5"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-primary-700 dark:text-primary-300 flex items-center gap-2">
                        {collegeName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {departments.length} {departments.length === 1 ? 'Department' : 'Departments'}
                      </p>
                    </div>
                  </div>
                  
                  {editingCollege !== collegeName && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCollege(collegeName)
                          setEditingDepartments([...departments])
                        }}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCollege(collegeName)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {editingCollege === collegeName ? (
                  <div className="space-y-3 border-t pt-4">
                    <label className="block text-sm font-medium">Departments</label>
                    {editingDepartments.map((dept, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={dept}
                          onChange={(e) => {
                            const newDepts = [...editingDepartments]
                            newDepts[idx] = e.target.value
                            setEditingDepartments(newDepts)
                          }}
                          className="input-field flex-1"
                        />
                        {editingDepartments.length > 1 && (
                          <button
                            onClick={() => setEditingDepartments(editingDepartments.filter((_, i) => i !== idx))}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setEditingDepartments([...editingDepartments, ''])}
                      className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Department
                    </button>
                    
                    <div className="flex gap-2 justify-end pt-3">
                      <button
                        onClick={() => {
                          setEditingCollege(null)
                          setEditingDepartments([])
                        }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveCollege(collegeName, editingDepartments)}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 border-t pt-4">
                    {departments.map((dept, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm flex items-center gap-1"
                      >
                        <BookOpen className="w-3 h-3" />
                        {dept}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
