"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Send, CheckCircle2, AlertCircle, Loader2, Plus, Trash2, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { COLLEGE_DEPARTMENTS } from '@/lib/colleges'

const educationEntrySchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().min(1, 'Institution is required'),
  percentage: z.string().min(1, 'Percentage/CGPA is required'),
  fromDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Format: MM/YYYY'),
  toDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Format: MM/YYYY')
})

const experienceEntrySchema = z.object({
  position: z.string().min(1, 'Position is required'),
  company: z.string().min(1, 'Company is required'),
  fromDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Format: MM/YYYY'),
  toDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Format: MM/YYYY'),
  remark: z.string().optional()
})

const schema = z.object({
  applicationType: z.string().default('Visiting Faculty'),
  college: z.string().default('L.D. College of Engineering, Ahmedabad'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  contactNo: z.string().min(10, 'Contact number must be at least 10 digits').regex(/^[0-9+\-\s()]+$/, 'Please enter a valid contact number'),
  educationQualifications: z.array(educationEntrySchema).min(1, 'At least one qualification is required'),
  experienceEntries: z.array(experienceEntrySchema).optional(),
  experience: z.string().optional(),
  designation: z.string().optional(),
  lengthOfService: z.string().optional(),
  remark: z.string().optional(),
  areaOfInterest: z.string().min(1, 'Area of interest is required'),
  department: z.array(z.string()).min(1, 'Please select at least one department'),
  labLectureBoth: z.string().min(1, 'Please select preferred mode'),
  preferredSubjects: z.string().min(1, 'Preferred subjects are required'),
  timeSlotDay: z.array(z.string()).min(1, 'Please select at least one day'),
  timeSlotPeriod: z.array(z.string()).min(1, 'Please select at least one period'),
  timeSlotText: z.string().optional(),
  resumeFile: z.string().optional(),
  linkedinLink: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  googleScholarLink: z.string().url('Please enter a valid URL').optional().or(z.literal(''))
})

type FormValues = z.infer<typeof schema>
type EducationEntry = z.infer<typeof educationEntrySchema>
type ExperienceEntry = z.infer<typeof experienceEntrySchema>

export default function ApplyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>([
    { degree: '', institution: '', percentage: '', fromDate: '', toDate: '' }
  ])
  const [experienceEntries, setExperienceEntries] = useState<ExperienceEntry[]>([
    { position: '', company: '', fromDate: '', toDate: '', remark: '' }
  ])
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([])
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([])
  const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(false)
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false)
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeFileName, setResumeFileName] = useState<string | null>(null)
  const [resumeFileError, setResumeFileError] = useState<string | null>(null)
  const [resumeUploading, setResumeUploading] = useState(false)
  const dayDropdownRef = useRef<HTMLDivElement>(null)
  const periodDropdownRef = useRef<HTMLDivElement>(null)
  const departmentDropdownRef = useRef<HTMLDivElement>(null)

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      applicationType: 'Visiting Faculty',
      college: 'L.D. College of Engineering, Ahmedabad',
      educationQualifications: [{ degree: '', institution: '', percentage: '', fromDate: '', toDate: '' }],
      experienceEntries: [{ position: '', company: '', fromDate: '', toDate: '', remark: '' }]
    }
  })

  // Set LDCE as default college and load departments on component mount
  useEffect(() => {
    const ldceCollege = 'L.D. College of Engineering, Ahmedabad'
    if (COLLEGE_DEPARTMENTS[ldceCollege]) {
      setAvailableDepartments(COLLEGE_DEPARTMENTS[ldceCollege])
    }
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dayDropdownRef.current && !dayDropdownRef.current.contains(event.target as Node)) {
        setIsDayDropdownOpen(false)
      }
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(event.target as Node)) {
        setIsPeriodDropdownOpen(false)
      }
      if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target as Node)) {
        setIsDepartmentDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addEducationEntry = () => {
    const newEntries = [...educationEntries, { degree: '', institution: '', percentage: '', fromDate: '', toDate: '' }]
    setEducationEntries(newEntries)
    setValue('educationQualifications', newEntries)
  }

  const removeEducationEntry = (index: number) => {
    if (educationEntries.length > 1) {
      const newEntries = educationEntries.filter((_, i) => i !== index)
      setEducationEntries(newEntries)
      setValue('educationQualifications', newEntries)
    }
  }

  const updateEducationEntry = (index: number, field: keyof EducationEntry, value: string) => {
    const newEntries = [...educationEntries]
    newEntries[index] = { ...newEntries[index], [field]: value }
    setEducationEntries(newEntries)
    setValue('educationQualifications', newEntries)
  }

  const addExperienceEntry = () => {
    const newEntries = [...experienceEntries, { position: '', company: '', fromDate: '', toDate: '', remark: '' }]
    setExperienceEntries(newEntries)
    setValue('experienceEntries', newEntries)
  }

  const removeExperienceEntry = (index: number) => {
    const newEntries = experienceEntries.filter((_, i) => i !== index)
    setExperienceEntries(newEntries)
    setValue('experienceEntries', newEntries)
  }

  const updateExperienceEntry = (index: number, field: keyof ExperienceEntry, value: string) => {
    const newEntries = [...experienceEntries]
    newEntries[index] = { ...newEntries[index], [field]: value }
    setExperienceEntries(newEntries)
    setValue('experienceEntries', newEntries)
  }

  async function onSubmit(data: FormValues) {
    setLoading(true)
    setError(null)
    setResumeFileError(null)
    try {
      if (!resumeFile) {
        setResumeFileError('Resume upload is required')
        throw new Error('Please upload your resume before submitting')
      }

      let resumePath = null
      
      resumePath = await uploadResumeFile()
      if (!resumePath) {
        throw new Error('Failed to upload resume file')
      }

      // Convert arrays to JSON strings for storage
      const submissionData = {
        ...data,
        resumeFile: resumePath,
        educationQualifications: JSON.stringify(data.educationQualifications),
        experienceEntries: JSON.stringify(data.experienceEntries)
      }
      
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Submission failed')
      }
      
      const json = await res.json()
      setSuccess(true)
      
      // Redirect after success
      setTimeout(() => {
        router.push(`/submitted?id=${json.applicationId}`)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit application')
      setLoading(false)
    }
  }

  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset previous errors
    setResumeFileError(null)

    // Validate file size (500 KB)
    const MAX_SIZE_MB = 0.5
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
    if (file.size > MAX_SIZE_BYTES) {
      setResumeFileError(
        `File size must be less than 500 KB. Current size: ${(file.size / 1024).toFixed(2)} KB`
      )
      setResumeFile(null)
      setResumeFileName(null)
      return
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
    if (!allowedTypes.includes(file.type)) {
      setResumeFileError('Only PDF, DOC, DOCX, and TXT files are allowed')
      setResumeFile(null)
      setResumeFileName(null)
      return
    }

    setResumeFile(file)
    setResumeFileName(file.name)
  }

  const uploadResumeFile = async (): Promise<string | null> => {
    if (!resumeFile) return null

    setResumeUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', resumeFile)

      const res = await fetch('/api/applications/upload-resume', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Resume upload failed')
      }

      const data = await res.json()
      return data.resumePath
    } catch (err: any) {
      setResumeFileError(err.message || 'Failed to upload resume')
      return null
    } finally {
      setResumeUploading(false)
    }
  }

  if (success) {
    return (
      <div className="container-custom py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Application Submitted!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Thank you for applying. We'll review your application and contact you soon.
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Redirecting...</span>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="gradient-bg min-h-screen py-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
              Application Form
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              For Visiting Faculty Position
            </p>
            <br></br>
            <p className="text-lg text-gray-900 dark:text-gray-100">Kindly Refer to the Resources page for important information and guidelines.</p>
          </div>

          

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                Basic Information
              </h2>

              <div className="space-y-6">
                {/* Hidden fields for applicationType and college */}
                <input type="hidden" {...register('applicationType')} />
                <input type="hidden" {...register('college')} />

                {/* Application Info Display */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">College:</span> L.D. College of Engineering, Ahmedabad
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    <span className="font-semibold">Position Type:</span> Visiting Faculty
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="label-field">Name of Applicant *</label>
                  <input
                    suppressHydrationWarning
                    {...register('name')}
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email and Contact */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="label-field">Email Address *</label>
                    <input
                      suppressHydrationWarning
                      {...register('email')}
                      type="email"
                      className="input-field"
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="label-field">Contact Number *</label>
                    <input
                      suppressHydrationWarning
                      {...register('contactNo')}
                      type="tel"
                      className="input-field"
                      placeholder="+91-9876543210"
                    />
                    {errors.contactNo && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.contactNo.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Education & Qualifications */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="label-field mb-0">Education & Qualifications *</label>
                    <motion.button
                      suppressHydrationWarning
                      type="button"
                      onClick={addEducationEntry}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:shadow-lg transition-shadow text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add More
                    </motion.button>
                  </div>
                  
                  <div className="space-y-4">
                    {educationEntries.map((entry, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-4"
                      >
                        <div className="flex items-center justify-end mb-2">
                          {educationEntries.length > 1 && (
                            <motion.button
                              suppressHydrationWarning
                              type="button"
                              onClick={() => removeEducationEntry(index)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Degree *
                            </label>
                            <input
                              suppressHydrationWarning
                              value={entry.degree}
                              onChange={(e) => updateEducationEntry(index, 'degree', e.target.value)}
                              className="input-field"
                              placeholder="e.g., B.Tech in Computer Engineering"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Institution *
                            </label>
                            <input
                              suppressHydrationWarning
                              value={entry.institution}
                              onChange={(e) => updateEducationEntry(index, 'institution', e.target.value)}
                              className="input-field"
                              placeholder="e.g., LDCE, Ahmedabad"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Percentage/CGPA *
                          </label>
                          <input
                            suppressHydrationWarning
                            value={entry.percentage}
                            onChange={(e) => updateEducationEntry(index, 'percentage', e.target.value)}
                            className="input-field"
                            placeholder="e.g., 85% or 8.5 CGPA"
                          />
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              From (MM/YYYY) *
                            </label>
                            <input
                              suppressHydrationWarning
                              value={entry.fromDate}
                              onChange={(e) => updateEducationEntry(index, 'fromDate', e.target.value)}
                              className="input-field"
                              placeholder="08/2015"
                              maxLength={7}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              To (MM/YYYY) *
                            </label>
                            <input
                              suppressHydrationWarning
                              value={entry.toDate}
                              onChange={(e) => updateEducationEntry(index, 'toDate', e.target.value)}
                              className="input-field"
                              placeholder="05/2019"
                              maxLength={7}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {errors.educationQualifications && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.educationQualifications.message || 'Please fill all education fields correctly'}
                    </p>
                  )}
                </div>

                {/* Professional Experience */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="label-field mb-0">Professional Experience</label>
                    <motion.button
                      suppressHydrationWarning
                      type="button"
                      onClick={addExperienceEntry}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:shadow-lg transition-shadow text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add More
                    </motion.button>
                  </div>
                  
                  <div className="space-y-4">
                    {experienceEntries.map((entry, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 space-y-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Entry {index + 1}
                          </span>
                          <motion.button
                            suppressHydrationWarning
                            type="button"
                            onClick={() => removeExperienceEntry(index)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Position/Designation *
                            </label>
                            <input
                              suppressHydrationWarning
                              value={entry.position}
                              onChange={(e) => updateExperienceEntry(index, 'position', e.target.value)}
                              className="input-field"
                              placeholder="e.g., Senior Software Engineer"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Company/Organization *
                            </label>
                            <input
                              suppressHydrationWarning
                              value={entry.company}
                              onChange={(e) => updateExperienceEntry(index, 'company', e.target.value)}
                              className="input-field"
                              placeholder="e.g., ABC Technologies Pvt. Ltd."
                            />
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              From (MM/YYYY) *
                            </label>
                            <input
                              suppressHydrationWarning
                              value={entry.fromDate}
                              onChange={(e) => updateExperienceEntry(index, 'fromDate', e.target.value)}
                              className="input-field"
                              placeholder="08/2015"
                              maxLength={7}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              To (MM/YYYY) *
                            </label>
                            <input
                              suppressHydrationWarning
                              value={entry.toDate}
                              onChange={(e) => updateExperienceEntry(index, 'toDate', e.target.value)}
                              className="input-field"
                              placeholder="05/2019"
                              maxLength={7}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Remark
                          </label>
                          <textarea
                            suppressHydrationWarning
                            value={entry.remark || ''}
                            onChange={(e) => updateExperienceEntry(index, 'remark', e.target.value)}
                            className="input-field resize-none"
                            rows={2}
                            placeholder="Any additional details about this experience..."
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {errors.experienceEntries && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.experienceEntries.message || 'Please fill all experience fields correctly'}
                    </p>
                  )}
                </div>

                {/* Additional Overall Remark */}
                <div>
                  <label className="label-field">Additional Overall Remark</label>
                  <textarea
                    suppressHydrationWarning
                    {...register('remark')}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Any additional information..."
                  />
                </div>
              </div>
            </motion.div>

            {/* Academic Preferences Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                Academic Preferences
              </h2>

              <div className="space-y-6">
                {/* Area of Interest */}
                <div>
                  <label className="label-field">Area of Interest <span className="text-gray-900 dark:text-white">*</span></label>
                  <textarea
                    suppressHydrationWarning
                    {...register('areaOfInterest')}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Describe your research interests and areas of expertise..."
                  />
                  {errors.areaOfInterest && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.areaOfInterest.message}
                    </p>
                  )}
                </div>

                {/* Department and Lab/Lecture */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Preferred Department Multi-Select Dropdown */}
                  <div className="relative" ref={departmentDropdownRef}>
                    <label className="label-field">Preferred Department <span className="text-gray-900 dark:text-white">*</span></label>
                    <div className="relative">
                      <button
                        suppressHydrationWarning
                        type="button"
                        onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
                        className="input-field w-full text-left flex items-center justify-between"
                      >
                        <span className="truncate">
                          {selectedDepartments.length > 0 ? selectedDepartments.join(', ') : 'Select departments...'}
                            </span>
                            <ChevronDown className={`w-5 h-5 transition-transform ${
                              isDepartmentDropdownOpen ? 'rotate-180' : ''
                            }`} />
                          </button>
                          {isDepartmentDropdownOpen && availableDepartments.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                              {availableDepartments.map((dept) => (
                                <label
                                  key={dept}
                                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                  <input
                                    suppressHydrationWarning
                                    type="checkbox"
                                    checked={selectedDepartments.includes(dept)}
                                    onChange={(e) => {
                                      const newDepts = e.target.checked
                                        ? [...selectedDepartments, dept]
                                        : selectedDepartments.filter(d => d !== dept)
                                      setSelectedDepartments(newDepts)
                                      setValue('department', newDepts)
                                    }}
                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                  />
                                  <span className="text-gray-700 dark:text-gray-300">{dept}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                    {errors.department && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.department.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="label-field">Preferred Mode <span className="text-gray-900 dark:text-white">*</span></label>
                    <select
                      suppressHydrationWarning
                      {...register('labLectureBoth')}
                      className="input-field"
                    >
                      <option value="">Select...</option>
                      <option value="Laboratory">Laboratory</option>
                      <option value="Lecture">Lecture</option>
                      <option value="Both">Both</option>
                    </select>
                    {errors.labLectureBoth && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.labLectureBoth.message}
                      </p>
                    )}
                  </div>
                </div>

                {errors.department && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.department.message}
                  </p>
                )}

                {/* Preferred Subjects */}
                <div>
                  <label className="label-field">Preferred Subjects <span className="text-gray-900 dark:text-white">*</span></label>
                  <textarea
                    suppressHydrationWarning
                    {...register('preferredSubjects')}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="List subjects you would like to teach..."
                  />
                  {errors.preferredSubjects && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.preferredSubjects.message}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Preferred Time Availability Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
                Preferred Time Availability
              </h2>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Preferred Day Multi-Select Dropdown */}
                  <div className="relative" ref={dayDropdownRef}>
                    <label className="label-field">Preferred Day <span className="text-gray-900 dark:text-white">*</span></label>
                    <div className="relative">
                      <button
                        suppressHydrationWarning
                        type="button"
                        onClick={() => setIsDayDropdownOpen(!isDayDropdownOpen)}
                        className="input-field w-full text-left flex items-center justify-between"
                      >
                        <span className="truncate">
                          {selectedDays.length > 0 ? selectedDays.join(', ') : 'Select days...'}
                        </span>
                        <ChevronDown className={`w-5 h-5 transition-transform ${
                          isDayDropdownOpen ? 'rotate-180' : ''
                        }`} />
                      </button>
                      {isDayDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                            <label
                              key={day}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                            >
                              <input
                                suppressHydrationWarning
                                type="checkbox"
                                checked={selectedDays.includes(day)}
                                onChange={(e) => {
                                  const newDays = e.target.checked
                                    ? [...selectedDays, day]
                                    : selectedDays.filter(d => d !== day)
                                  setSelectedDays(newDays)
                                  setValue('timeSlotDay', newDays)
                                }}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                              />
                              <span className="text-gray-700 dark:text-gray-300">{day}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preferred Period Multi-Select Dropdown */}
                  <div className="relative" ref={periodDropdownRef}>
                    <label className="label-field">Preferred Period <span className="text-gray-900 dark:text-white">*</span></label>
                    <div className="relative">
                      <button
                        suppressHydrationWarning
                        type="button"
                        onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                        className="input-field w-full text-left flex items-center justify-between"
                      >
                        <span className="truncate">
                          {selectedPeriods.length > 0 ? selectedPeriods.join(', ') : 'Select periods...'}
                        </span>
                        <ChevronDown className={`w-5 h-5 transition-transform ${
                          isPeriodDropdownOpen ? 'rotate-180' : ''
                        }`} />
                      </button>
                      {isPeriodDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {[
                            { value: 'Morning', label: 'Morning (9 AM - 12 PM)' },
                            { value: 'Noon', label: 'Noon (12 PM - 3 PM)' },
                            { value: 'Evening', label: 'Evening (3 PM - 6 PM)' }
                          ].map((period) => (
                            <label
                              key={period.value}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                            >
                              <input
                                suppressHydrationWarning
                                type="checkbox"
                                checked={selectedPeriods.includes(period.value)}
                                onChange={(e) => {
                                  const newPeriods = e.target.checked
                                    ? [...selectedPeriods, period.value]
                                    : selectedPeriods.filter(p => p !== period.value)
                                  setSelectedPeriods(newPeriods)
                                  setValue('timeSlotPeriod', newPeriods)
                                }}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                              />
                              <span className="text-gray-700 dark:text-gray-300">{period.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="label-field">Specific Time Slot <span className="text-gray-900 dark:text-white">(Optional)</span></label>
                    <input
                      suppressHydrationWarning
                      {...register('timeSlotText')}
                      className="input-field"
                      placeholder="e.g., 10:00 - 11:30 AM"
                    />
                    {errors.timeSlotText && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.timeSlotText.message}
                      </p>
                    )}
                  </div>
                </div>
                {(errors.timeSlotDay || errors.timeSlotPeriod) && (
                  <div className="space-y-2">
                    {errors.timeSlotDay && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.timeSlotDay.message}
                      </p>
                    )}
                    {errors.timeSlotPeriod && (
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.timeSlotPeriod.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Documents Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                  4
                </div>
                Documents & Links
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="label-field">
                    Resume Upload <span className="text-gray-900 dark:text-white">*</span>{' '}
                    <span className="text-gray-600 dark:text-gray-400 text-sm font-normal">(Max 500 KB)</span>
                  </label>
                  <div className="relative">
                    <input
                      suppressHydrationWarning
                      type="file"
                      onChange={handleResumeFileChange}
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      id="resume-file-input"
                      disabled={resumeUploading}
                    />
                    <label
                      htmlFor="resume-file-input"
                      className="input-field block cursor-pointer text-center py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {resumeFileName ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <span className="text-green-700 dark:text-green-300">{resumeFileName}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                          <span>📎 Click to upload resume (PDF, DOC, DOCX, TXT)</span>
                        </div>
                      )}
                    </label>
                  </div>
                  {resumeFileError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {resumeFileError}
                    </p>
                  )}
                  {resumeFile && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      File: {(resumeFile.size / 1024).toFixed(2)} KB
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="label-field">LinkedIn Profile (Optional)</label>
                    <input
                      suppressHydrationWarning
                      {...register('linkedinLink')}
                      className="input-field"
                      placeholder="https://linkedin.com/in/yourprofile"
                      type="url"
                    />
                    {errors.linkedinLink && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.linkedinLink.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="label-field">Google Scholar Profile (Optional)</label>
                    <input
                      suppressHydrationWarning
                      {...register('googleScholarLink')}
                      className="input-field"
                      placeholder="https://scholar.google.com/citations?user=..."
                      type="url"
                    />
                    {errors.googleScholarLink && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.googleScholarLink.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              >
                <div className="flex items-center gap-3 text-red-800 dark:text-red-200">
                  <AlertCircle className="w-6 h-6" />
                  <div>
                    <p className="font-semibold">Submission Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center"
            >
              <motion.button
                suppressHydrationWarning
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="btn-primary text-lg px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
