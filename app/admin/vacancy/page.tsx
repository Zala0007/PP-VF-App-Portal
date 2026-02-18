"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Save, X, Building2, ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'
import { GUJARAT_COLLEGES, COLLEGE_DEPARTMENTS } from '@/lib/colleges'

type Vacancy = {
  id: number
  college: string
  department: string
  professorInPractice: number
  visitingFaculty: number
}

type EditingVacancy = Vacancy | null

export default function AdminVacancyPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<EditingVacancy>(null)
  const [adding, setAdding] = useState(false)
  const [newVacancy, setNewVacancy] = useState({ college: '', department: '', professorInPractice: 0, visitingFaculty: 0 })
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([])
  const [editingDepartments, setEditingDepartments] = useState<string[]>([])

  // Update available departments when college changes for new vacancy
  useEffect(() => {
    if (newVacancy.college && COLLEGE_DEPARTMENTS[newVacancy.college]) {
      setAvailableDepartments(COLLEGE_DEPARTMENTS[newVacancy.college])
      setNewVacancy(prev => ({ ...prev, department: '' }))
    } else {
      setAvailableDepartments([])
    }
  }, [newVacancy.college])

  // Update available departments when college changes for editing
  useEffect(() => {
    if (editing?.college && COLLEGE_DEPARTMENTS[editing.college]) {
      setEditingDepartments(COLLEGE_DEPARTMENTS[editing.college])
    } else {
      setEditingDepartments([])
    }
  }, [editing?.college])

  const fetchVacancies = () => {
    const token = sessionStorage.getItem('admin_token')
    fetch('/api/vacancies', { headers: { 'x-admin-token': token || '' } })
      .then((r) => r.json())
      .then((data) => setVacancies(data.vacancies || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchVacancies()
  }, [])

  const handleAdd = async () => {
    if (!newVacancy.college) {
      alert('Please select a college')
      return
    }
    if (!newVacancy.department) {
      alert('Please select a department')
      return
    }
    
    const token = sessionStorage.getItem('admin_token')
    const response = await fetch('/api/vacancies', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-token': token || ''
      },
      body: JSON.stringify(newVacancy)
    })

    if (response.ok) {
      setAdding(false)
      setNewVacancy({ college: '', department: '', professorInPractice: 0, visitingFaculty: 0 })
      fetchVacancies()
    }
  }

  const handleUpdate = async (id: number) => {
    const token = sessionStorage.getItem('admin_token')
    const response = await fetch(`/api/vacancies/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-token': token || ''
      },
      body: JSON.stringify(editing)
    })

    if (response.ok) {
      setEditing(null)
      fetchVacancies()
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vacancy?')) return
    
    const token = sessionStorage.getItem('admin_token')
    const response = await fetch(`/api/vacancies/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': token || '' }
    })

    if (response.ok) {
      fetchVacancies()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const totalVacancies = vacancies.reduce((sum, v) => sum + v.professorInPractice + v.visitingFaculty, 0)
  const totalPIP = vacancies.reduce((sum, v) => sum + v.professorInPractice, 0)
  const totalVF = vacancies.reduce((sum, v) => sum + v.visitingFaculty, 0)

  return (
    <div className="gradient-bg min-h-screen">
      <div className="container-custom py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/admin">
          <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Admin Dashboard
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-600 rounded-xl">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Vacancies</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{totalVacancies}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Professor in Practice</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalPIP}</p>
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
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalVF}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Manage Vacancies</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Update department-wise vacancy information</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAdding(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </motion.button>
      </div>

      {/* Add New Vacancy Form */}
      {adding && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Add New Department
            </h3>
            <button onClick={() => setAdding(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">College *</label>
              <select
                value={newVacancy.college}
                onChange={(e) => setNewVacancy({ ...newVacancy, college: e.target.value })}
                className="input-field"
              >
                <option value="">Select College...</option>
                {GUJARAT_COLLEGES.map((college) => (
                  <option key={college} value={college}>{college}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Department *</label>
              <select
                value={newVacancy.department}
                onChange={(e) => setNewVacancy({ ...newVacancy, department: e.target.value })}
                className="input-field"
                disabled={!newVacancy.college}
              >
                <option value="">{!newVacancy.college ? 'Select college first...' : 'Select Department...'}</option>
                {availableDepartments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Professor in Practice</label>
              <input
                type="number"
                min="0"
                value={newVacancy.professorInPractice}
                onChange={(e) => setNewVacancy({ ...newVacancy, professorInPractice: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Visiting Faculty</label>
              <input
                type="number"
                min="0"
                value={newVacancy.visitingFaculty}
                onChange={(e) => setNewVacancy({ ...newVacancy, visitingFaculty: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setAdding(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              Cancel
            </button>
            <button 
              onClick={handleAdd} 
              disabled={!newVacancy.college || !newVacancy.department}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </motion.div>
      )}

      {/* Vacancies Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">College</th>
                <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Department</th>
                <th className="text-center p-4 font-semibold text-gray-700 dark:text-gray-300">Professor in Practice</th>
                <th className="text-center p-4 font-semibold text-gray-700 dark:text-gray-300">Visiting Faculty</th>
                <th className="text-center p-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vacancies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No vacancies added yet. Click "Add Department" to get started.
                  </td>
                </tr>
              ) : (
                vacancies.map((vacancy, index) => (
                  <motion.tr
                    key={vacancy.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.05 * index }}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    {editing?.id === vacancy.id ? (
                      <>
                        <td className="p-4">
                          <select
                            value={editing.college}
                            onChange={(e) => setEditing({ ...editing, college: e.target.value })}
                            className="input-field"
                          >
                            {GUJARAT_COLLEGES.map((college) => (
                              <option key={college} value={college}>{college}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4">
                          <select
                            value={editing.department}
                            onChange={(e) => setEditing({ ...editing, department: e.target.value })}
                            className="input-field"
                          >
                            <option value="">Select Department...</option>
                            {editingDepartments.map((dept) => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4">
                          <input
                            type="number"
                            min="0"
                            value={editing.professorInPractice}
                            onChange={(e) => setEditing({ ...editing, professorInPractice: parseInt(e.target.value) || 0 })}
                            className="input-field text-center"
                          />
                        </td>
                        <td className="p-4">
                          <input
                            type="number"
                            min="0"
                            value={editing.visitingFaculty}
                            onChange={(e) => setEditing({ ...editing, visitingFaculty: parseInt(e.target.value) || 0 })}
                            className="input-field text-center"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleUpdate(vacancy.id)}
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditing(null)}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4 text-gray-600 dark:text-gray-400">{vacancy.college}</td>
                        <td className="p-4 font-medium">{vacancy.department}</td>
                        <td className="p-4 text-center">{vacancy.professorInPractice}</td>
                        <td className="p-4 text-center">{vacancy.visitingFaculty}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setEditing(vacancy)}
                              className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(vacancy.id)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  )
}
