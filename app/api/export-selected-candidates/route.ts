import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { parseDepartments, verifyAdminToken } from '@/lib/roleAuth'
import * as XLSX from 'xlsx'

function parseJsonArray(value: string | null) {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function formatDate(value: Date | null) {
  return value ? new Date(value).toLocaleString('en-IN') : 'N/A'
}

export async function GET(request: NextRequest) {
  const token = request.headers.get('x-admin-token')

  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const applications = await prisma.application.findMany({
      where: { selectionStatus: 'Selected' },
      orderBy: [
        { department: 'asc' },
        { name: 'asc' }
      ]
    })

    if (applications.length === 0) {
      return NextResponse.json({ error: 'No selected candidates found' }, { status: 404 })
    }

    const rows = applications.map((app) => {
      const departments = parseDepartments(app.department)
      const educationQualifications = parseJsonArray(app.educationQualifications)
      const experienceEntries = parseJsonArray(app.experienceEntries)

      const education = educationQualifications
        .map((edu: any) => `${edu.degree || ''} from ${edu.institution || ''} (${edu.fromDate || ''} - ${edu.toDate || ''}) - ${edu.percentage || ''}`)
        .join(' | ')

      const experience = experienceEntries
        .map((exp: any) => `${exp.position || ''} at ${exp.company || ''} (${exp.fromDate || ''} - ${exp.toDate || ''})`)
        .join(' | ')

      return {
        'Application ID': app.applicationId,
        'Name': app.name,
        'Email': app.email,
        'Contact Number': app.contactNo,
        'College': app.college || 'N/A',
        'Department(s)': departments.length > 0 ? departments.join(', ') : 'N/A',
        'Selection Status': app.selectionStatus,
        'Application Type': app.applicationType,
        'Preferred Subjects': app.preferredSubjects || 'N/A',
        'Area of Interest': app.areaOfInterest || 'N/A',
        'Education Qualifications': education || 'N/A',
        'Professional Experience': experience || 'N/A',
        'Resume File': app.resumeFile || 'N/A',
        'Submitted Date': formatDate(app.dateTimeOfSubmit)
      }
    })

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(rows)
    worksheet['!cols'] = [
      { wch: 16 },
      { wch: 26 },
      { wch: 32 },
      { wch: 16 },
      { wch: 36 },
      { wch: 36 },
      { wch: 18 },
      { wch: 22 },
      { wch: 32 },
      { wch: 32 },
      { wch: 56 },
      { wch: 56 },
      { wch: 42 },
      { wch: 22 }
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected Candidates')

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    const filename = `Selected_Candidates_${new Date().toISOString().split('T')[0]}.xlsx`

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Error exporting selected candidates:', error)
    return NextResponse.json({ error: 'Failed to export selected candidates' }, { status: 500 })
  }
}
