import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { parseDepartments, verifyAdminToken } from '@/lib/roleAuth'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request.headers.get('x-admin-token'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const applications = await prisma.application.findMany({
      orderBy: { dateTimeOfSubmit: 'desc' }
    })

    if (applications.length === 0) {
      return NextResponse.json({ error: 'No applications found' }, { status: 404 })
    }

    const rows = applications.map((application) => ({
      'Application ID': application.applicationId,
      'Name': application.name,
      'Email': application.email,
      'Contact Number': application.contactNo,
      'College': application.college || 'N/A',
      'Department(s)': parseDepartments(application.department).join(', ') || 'N/A',
      'Application Type': application.applicationType,
      'Reviewed': application.reviewed ? 'Yes' : 'No',
      'Selection Status': application.selectionStatus,
      'Preferred Subjects': application.preferredSubjects || 'N/A',
      'Area of Interest': application.areaOfInterest || 'N/A',
      'Resume File': application.resumeFile || 'N/A',
      'Submitted Date': new Date(application.dateTimeOfSubmit).toLocaleString('en-IN')
    }))

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(rows)
    worksheet['!cols'] = [
      { wch: 16 }, { wch: 26 }, { wch: 32 }, { wch: 16 }, { wch: 36 },
      { wch: 36 }, { wch: 22 }, { wch: 12 }, { wch: 20 }, { wch: 32 },
      { wch: 32 }, { wch: 42 }, { wch: 22 }
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, 'All Applications')

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    const filename = `All_Applications_${new Date().toISOString().split('T')[0]}.xlsx`

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Error exporting all applications:', error)
    return NextResponse.json({ error: 'Failed to export applications' }, { status: 500 })
  }
}
