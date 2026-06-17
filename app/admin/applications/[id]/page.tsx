"use client"
import React, { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, ArrowLeft, Calendar, Mail, Phone, GraduationCap, Briefcase, Clock, FileCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ApplicationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [backHref, setBackHref] = useState('/admin/applications')
  const printRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const adminToken = sessionStorage.getItem('admin_token')
    const hodToken = sessionStorage.getItem('hod_token')

    if (!adminToken && !hodToken) {
      window.location.href = '/admin'
      return
    }

    if (hodToken && !adminToken) {
      setBackHref('/hod')
    }

    const headers: Record<string, string> = adminToken
      ? { 'x-admin-token': adminToken }
      : { 'x-hod-token': hodToken || '' }

    fetch(`/api/applications/${id}`, { headers })
      .then((r) => r.json())
      .then(setItem)
      .finally(() => setLoading(false))
  }, [id])

  const handleExportPDF = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!item || item.error) {
    return (
      <div className="container-custom py-8">
        <div className="card text-center">
          <h2 className="text-2xl font-bold text-red-600">Not Found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Application not found or unauthorized</p>
          <Link href={backHref} className="btn-primary mt-4 inline-block">
            Back to Applications
          </Link>
        </div>
      </div>
    )
  }

  const InfoSection = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg text-primary-600 dark:text-primary-400">
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {children}
    </motion.div>
  )

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <dt className="font-medium text-gray-600 dark:text-gray-400">{label}</dt>
      <dd className="col-span-2 text-gray-900 dark:text-gray-100">{value || '—'}</dd>
    </div>
  )

  // Parse education qualifications if it's a JSON string
  let educationData = []
  try {
    if (item?.educationQualifications) {
      educationData = typeof item.educationQualifications === 'string' 
        ? JSON.parse(item.educationQualifications) 
        : item.educationQualifications
    }
  } catch (e) {
    console.error('Failed to parse education data:', e)
  }

  // Parse experience entries if it's a JSON string
  let experienceData = []
  try {
    if (item?.experienceEntries) {
      experienceData = typeof item.experienceEntries === 'string' 
        ? JSON.parse(item.experienceEntries) 
        : item.experienceEntries
    }
  } catch (e) {
    console.error('Failed to parse experience data:', e)
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body * { visibility: hidden; }
          body {
            background: white !important;
          }
          #printable, #printable * { visibility: visible; }
          #printable { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 0;
            font-size: 13px;
            line-height: 1.35;
          }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .card {
            background: white !important;
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          h1, h2, h3, h4, h5, h6, p, span, div, dt, dd {
            color: black !important;
          }
          .print-header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 12px;
            margin-bottom: 18px;
            font-size: 12px;
          }
          .print-header-logo {
            width: 50px;
            height: 50px;
            object-fit: contain;
          }
          .print-header-content {
            flex: 1;
            text-align: center;
          }
          .print-section {
            margin-bottom: 16px;
            page-break-inside: avoid;
          }
          .print-section-title {
            font-size: 14px;
            font-weight: bold;
            background: #f3f4f6;
            padding: 7px 10px;
            border-left: 4px solid #3b82f6;
            margin-bottom: 10px;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            font-size: 12.5px;
          }
          .print-table td {
            padding: 7px 8px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
          }
          .print-table td:first-child {
            font-weight: 600;
            width: 28%;
          }
          .print-entry {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            padding: 10px 12px;
            margin-bottom: 8px;
            font-size: 12.5px;
            line-height: 1.4;
          }
          .print-entry-header {
            font-weight: 600;
            margin-bottom: 5px;
            font-size: 13.5px;
          }
          .print-entry-date {
            color: #6b7280 !important;
            font-size: 11.5px;
            margin-bottom: 6px;
          }
          a {
            color: #2563eb !important;
            text-decoration: underline !important;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>

      <div className="gradient-bg min-h-screen">
        <div className="container-custom py-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6 no-print">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Applications
          </button>
          <button
            onClick={handleExportPDF}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export as PDF
          </button>
        </div>

        {/* Printable Content */}
        <div id="printable" ref={printRef}>
          {/* Print Header */}
          <div className="print-only print-header">
            <h1 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
              L D College of Engineering
            </h1>
            <h2 style={{ fontSize: '12px', marginBottom: '3px' }}>
              Education Department, Government of Gujarat
            </h2>
            <h3 style={{ fontSize: '11px', marginBottom: '3px' }}>
              Visiting Faculty Online Application Form
            </h3>
            <p style={{ fontSize: '9px', color: '#6b7280' }}>
              Application ID: {item.applicationId || `#${item.id}`} | Submitted: {new Date(item.dateTimeOfSubmit).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(item.dateTimeOfSubmit).toLocaleTimeString('en-IN')}
            </p>
          </div>

          {/* Web View Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-6 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-2 border-primary-200 dark:border-primary-800 no-print"
          >
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-2">
                  {item.name}
                </h1>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full font-medium">
                    {item.applicationType}
                  </span>
                  <span className="px-3 py-1 bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 rounded-full font-medium">
                    {item.applicationId || `#${item.id}`}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2 justify-end">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(item.dateTimeOfSubmit).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="text-xs mt-1">{new Date(item.dateTimeOfSubmit).toLocaleTimeString('en-IN')}</div>
              </div>
            </div>
          </motion.div>

          {/* Print: Basic Information */}
          <div className="print-only print-section">
            <div className="print-section-title">BASIC INFORMATION</div>
            <table className="print-table">
              <tbody>
                <tr>
                  <td>Name</td>
                  <td>{item.name}</td>
                </tr>
                <tr>
                  <td>Email</td>
                  <td>{item.email || '—'}</td>
                </tr>
                <tr>
                  <td>Contact Number</td>
                  <td>{item.contactNo || '—'}</td>
                </tr>
                <tr>
                  <td>Application Type</td>
                  <td>{item.applicationType}</td>
                </tr>
                {item.college && (
                  <tr>
                    <td>College</td>
                    <td>{item.college}</td>
                  </tr>
                )}
                <tr>
                  <td>Department</td>
                  <td>{item.department || '—'}</td>
                </tr>
                {item.remark && (
                  <tr>
                    <td>Remarks</td>
                    <td>{item.remark}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Print: Education & Qualifications */}
          <div className="print-only print-section">
            <div className="print-section-title">EDUCATION & QUALIFICATIONS</div>
            {educationData.length > 0 ? (
              educationData.map((edu: any, index: number) => (
                <div key={index} className="print-entry">
                  <div className="print-entry-header">{edu.degree}</div>
                  <div className="print-entry-date">{edu.fromDate} - {edu.toDate}</div>
                  <div>Institution: {edu.institution}</div>
                  {edu.percentage && <div>Percentage/CGPA: {edu.percentage}</div>}
                </div>
              ))
            ) : (
              <p>No education information provided</p>
            )}
          </div>

          {/* Print: Professional Experience */}
          <div className="print-only print-section">
            <div className="print-section-title">PROFESSIONAL EXPERIENCE</div>
            {experienceData.length > 0 ? (
              experienceData.map((exp: any, index: number) => (
                <div key={index} className="print-entry">
                  <div className="print-entry-header">{exp.position}</div>
                  <div className="print-entry-date">{exp.fromDate} - {exp.toDate}</div>
                  <div>Company/Organization: {exp.company}</div>
                  {exp.remark && <div>Remark: {exp.remark}</div>}
                </div>
              ))
            ) : (
              <p>No experience information provided</p>
            )}
          </div>

          {/* Print: Academic Preferences */}
          <div className="print-only print-section">
            <div className="print-section-title">ACADEMIC PREFERENCES</div>
            <table className="print-table">
              <tbody>
                {item.areaOfInterest && (
                  <tr>
                    <td>Area of Interest</td>
                    <td>{item.areaOfInterest}</td>
                  </tr>
                )}
                {item.preferredSubjects && (
                  <tr>
                    <td>Preferred Subjects</td>
                    <td>{item.preferredSubjects}</td>
                  </tr>
                )}
                {item.labLectureBoth && (
                  <tr>
                    <td>Mode</td>
                    <td>{item.labLectureBoth}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Print: Time Availability */}
          <div className="print-only print-section">
            <div className="print-section-title">TIME AVAILABILITY</div>
            <table className="print-table">
              <tbody>
                {item.timeSlotDay && (
                  <tr>
                    <td>Preferred Days</td>
                    <td>{Array.isArray(item.timeSlotDay) ? item.timeSlotDay.join(', ') : item.timeSlotDay}</td>
                  </tr>
                )}
                {item.timeSlotPeriod && (
                  <tr>
                    <td>Preferred Period</td>
                    <td>{Array.isArray(item.timeSlotPeriod) ? item.timeSlotPeriod.join(', ') : item.timeSlotPeriod}</td>
                  </tr>
                )}
                {item.timeSlotText && (
                  <tr>
                    <td>Specific Time Slot</td>
                    <td>{item.timeSlotText}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Print: Documents & Links */}
          <div className="print-only print-section">
            <div className="print-section-title">DOCUMENTS & LINKS</div>
            <table className="print-table">
              <tbody>
                {item.resumeFile && (
                  <tr>
                    <td>Resume</td>
                    <td><a href={item.resumeFile} target="_blank" rel="noopener noreferrer">View Uploaded Resume</a></td>
                  </tr>
                )}
                {item.linkedinLink && (
                  <tr>
                    <td>LinkedIn Profile</td>
                    <td><a href={item.linkedinLink} target="_blank" rel="noopener noreferrer">{item.linkedinLink}</a></td>
                  </tr>
                )}
                {item.googleScholarLink && (
                  <tr>
                    <td>Google Scholar</td>
                    <td><a href={item.googleScholarLink} target="_blank" rel="noopener noreferrer">{item.googleScholarLink}</a></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Web View Grid (hidden in print) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
            {/* Contact Information */}
            <InfoSection title="Contact Information" icon={<Mail className="w-5 h-5" />}>
              <dl>
                <InfoRow label="Email" value={item.email} />
                <InfoRow label="Contact Number" value={item.contactNo} />
              </dl>
            </InfoSection>

            {/* Academic Information */}
            <InfoSection title="Academic Information" icon={<GraduationCap className="w-5 h-5" />}>
              <dl>
                {item.college && <InfoRow label="College" value={item.college} />}
                <InfoRow label="Department" value={item.department} />
                <InfoRow label="Area of Interest" value={item.areaOfInterest} />
                <InfoRow label="Preferred Subjects" value={item.preferredSubjects} />
              </dl>
            </InfoSection>

            {/* Education & Qualifications */}
            <InfoSection title="Education & Qualifications" icon={<GraduationCap className="w-5 h-5" />}>
              {educationData.length > 0 ? (
                <div className="space-y-4">
                  {educationData.map((edu: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-end mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {edu.fromDate} - {edu.toDate}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{edu.degree}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{edu.institution}</p>
                      {edu.percentage && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span className="font-medium">Percentage/CGPA:</span> {edu.percentage}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No education information provided</p>
              )}
            </InfoSection>

            {/* Professional Experience */}
            <InfoSection title="Professional Experience" icon={<Briefcase className="w-5 h-5" />}>
              {experienceData.length > 0 ? (
                <div className="space-y-4">
                  {experienceData.map((exp: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-end mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {exp.fromDate} - {exp.toDate}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{exp.position}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company}</p>
                      {exp.remark && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                          {exp.remark}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <dl>
                  <InfoRow label="Experience" value={item.experience} />
                  <InfoRow label="Designation" value={item.designation} />
                  <InfoRow label="Length of Service" value={item.lengthOfService} />
                  <InfoRow label="Remark" value={item.remark} />
                </dl>
              )}
            </InfoSection>

            {/* Engagement Preferences */}
            <InfoSection title="Engagement Preferences" icon={<Clock className="w-5 h-5" />}>
              <dl>

                <InfoRow label="Lab/Lecture/Both" value={item.labLectureBoth} />
                <InfoRow label="Time Slot Day" value={Array.isArray(item.timeSlotDay) ? item.timeSlotDay.join(', ') : item.timeSlotDay} />
                <InfoRow label="Time Slot Period" value={Array.isArray(item.timeSlotPeriod) ? item.timeSlotPeriod.join(', ') : item.timeSlotPeriod} />
                <InfoRow label="Time Slot Details" value={item.timeSlotText} />
              </dl>
            </InfoSection>

            {/* Documents & Links */}
            <InfoSection title="Documents & Links" icon={<FileCheck className="w-5 h-5" />}>
              <dl>
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <dt className="font-medium text-gray-600 dark:text-gray-400">Resume</dt>
                  <dd className="col-span-2">
                    {item.resumeFile ? (
                      <a
                        href={item.resumeFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        View Uploaded Resume
                      </a>
                    ) : '—'}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <dt className="font-medium text-gray-600 dark:text-gray-400">LinkedIn Profile</dt>
                  <dd className="col-span-2">
                    {item.linkedinLink ? (
                      <a
                        href={item.linkedinLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        View LinkedIn
                      </a>
                    ) : '—'}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3">
                  <dt className="font-medium text-gray-600 dark:text-gray-400">Google Scholar</dt>
                  <dd className="col-span-2">
                    {item.googleScholarLink ? (
                      <a
                        href={item.googleScholarLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        View Scholar Profile
                      </a>
                    ) : '—'}
                  </dd>
                </div>
              </dl>
            </InfoSection>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}
