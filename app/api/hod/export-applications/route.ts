import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  applicationBelongsToDepartment,
  getApplicationReviewDepartments,
  LDCE_COLLEGE_NAME,
  parseDepartments,
  verifyHodToken
} from '@/lib/roleAuth'
import * as XLSX from 'xlsx'

function safeFilePart(value: string) {
  return value.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

function parseJsonArray(value: string | null) {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function formatEducation(value: string | null) {
  return parseJsonArray(value)
    .map((entry: any) =>
      [
        entry.degree,
        entry.institution && `from ${entry.institution}`,
        (entry.fromDate || entry.toDate) && `(${entry.fromDate || 'N/A'} - ${entry.toDate || 'N/A'})`,
        entry.percentage && `Percentage/CGPA: ${entry.percentage}`
      ].filter(Boolean).join(' ')
    )
    .join(' | ') || 'N/A'
}

function formatExperience(value: string | null) {
  return parseJsonArray(value)
    .map((entry: any) =>
      [
        entry.position,
        entry.company && `at ${entry.company}`,
        (entry.fromDate || entry.toDate) && `(${entry.fromDate || 'N/A'} - ${entry.toDate || 'N/A'})`,
        entry.remark && `Remark: ${entry.remark}`
      ].filter(Boolean).join(' ')
    )
    .join(' | ') || 'N/A'
}

function formatList(value: string | null) {
  const values = parseJsonArray(value)
  return values.length > 0 ? values.join(', ') : value || 'N/A'
}

export async function GET(request: NextRequest) {
  const credential = verifyHodToken(request.headers.get('x-hod-token'))

  if (!credential) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const applications = await prisma.application.findMany({
      where: { college: LDCE_COLLEGE_NAME },
      include: { departmentReviews: true },
      orderBy: { dateTimeOfSubmit: 'desc' }
    })

    const rows = applications
      .filter((application) =>
        applicationBelongsToDepartment(application.department, credential.department)
      )
      .flatMap((application) => {
        const selectedDepartments = parseDepartments(application.department)
        const reviewDepartments = getApplicationReviewDepartments(
          application.department,
          credential.department
        )

        return reviewDepartments.map((department) => {
          const review = application.departmentReviews.find(
            (departmentReview) => departmentReview.department === department
          )

          return {
            'Application ID': application.applicationId,
            'Application Type': application.applicationType,
            'Name': application.name,
            'Email': application.email,
            'Contact Number': application.contactNo,
            'College': application.college || 'N/A',
            'Selected Department(s)': selectedDepartments.join(', ') || 'N/A',
            'Review Department': department,
            'Education Qualifications': formatEducation(application.educationQualifications),
            'Professional Experience': formatExperience(application.experienceEntries),
            'Remark': application.remark || 'N/A',
            'Area of Interest': application.areaOfInterest || 'N/A',
            'Preferred Subjects': application.preferredSubjects || 'N/A',
            'Mode (Lab/Lecture/Both)': application.labLectureBoth || 'N/A',
            'Preferred Days': formatList(application.timeSlotDay),
            'Preferred Period': formatList(application.timeSlotPeriod),
            'Specific Time Slot': application.timeSlotText || 'N/A',
            'Resume File': application.resumeFile || 'N/A',
            'LinkedIn Profile': application.linkedinLink || 'N/A',
            'Google Scholar': application.googleScholarLink || 'N/A',
            'Reviewed': review?.reviewed ? 'Yes' : 'No',
            'Selection Status': review?.selectionStatus || 'Pending',
            'Submitted Date': new Date(application.dateTimeOfSubmit).toLocaleString('en-IN'),
            'Created Date': new Date(application.createdAt).toLocaleString('en-IN')
          }
        })
      })

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No department applications found' }, { status: 404 })
    }

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(rows)
    worksheet['!cols'] = [
      { wch: 16 }, { wch: 22 }, { wch: 26 }, { wch: 32 }, { wch: 16 },
      { wch: 36 }, { wch: 45 }, { wch: 38 }, { wch: 55 }, { wch: 55 },
      { wch: 35 }, { wch: 35 }, { wch: 35 }, { wch: 24 }, { wch: 28 },
      { wch: 28 }, { wch: 30 }, { wch: 45 }, { wch: 45 }, { wch: 45 },
      { wch: 12 }, { wch: 22 }, { wch: 22 }, { wch: 22 }
    ]
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Department Applications')

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    const filename = `${safeFilePart(credential.department)}_Applications_${new Date().toISOString().split('T')[0]}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('HOD application export error:', error)
    return NextResponse.json({ error: 'Failed to export department applications' }, { status: 500 })
  }
}
