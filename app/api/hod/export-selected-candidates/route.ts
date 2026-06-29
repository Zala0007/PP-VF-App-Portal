import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  getHodDepartmentAliases,
  LDCE_COLLEGE_NAME,
  parseDepartments,
  verifyHodToken
} from '@/lib/roleAuth'
import * as XLSX from 'xlsx'

function safeFilePart(value: string) {
  return value.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

export async function GET(request: NextRequest) {
  const credential = verifyHodToken(request.headers.get('x-hod-token'))

  if (!credential) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const selectedReviews = await prisma.applicationDepartmentReview.findMany({
      where: {
        department: { in: getHodDepartmentAliases(credential.department) },
        selectionStatus: 'Selected',
        application: { college: LDCE_COLLEGE_NAME }
      },
      include: { application: true },
      orderBy: [
        { department: 'asc' },
        { application: { name: 'asc' } }
      ]
    })

    if (selectedReviews.length === 0) {
      return NextResponse.json({ error: 'No selected candidates found' }, { status: 404 })
    }

    const rows = selectedReviews.map((review) => {
      const application = review.application

      return {
        'Application ID': application.applicationId,
        'Name': application.name,
        'Email': application.email,
        'Contact Number': application.contactNo,
        'College': application.college || 'N/A',
        'Selected Department(s)': parseDepartments(application.department).join(', ') || 'N/A',
        'Selected By Department': review.department,
        'Selection Status': review.selectionStatus,
        'Application Type': application.applicationType,
        'Preferred Subjects': application.preferredSubjects || 'N/A',
        'Area of Interest': application.areaOfInterest || 'N/A',
        'Resume File': application.resumeFile || 'N/A',
        'Submitted Date': new Date(application.dateTimeOfSubmit).toLocaleString('en-IN')
      }
    })

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(rows)
    worksheet['!cols'] = [
      { wch: 16 }, { wch: 26 }, { wch: 32 }, { wch: 16 }, { wch: 36 },
      { wch: 45 }, { wch: 38 }, { wch: 22 }, { wch: 22 }, { wch: 35 },
      { wch: 35 }, { wch: 45 }, { wch: 22 }
    ]
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected Candidates')

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    const filename = `${safeFilePart(credential.department)}_Selected_Candidates_${new Date().toISOString().split('T')[0]}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('HOD selected-candidate export error:', error)
    return NextResponse.json({ error: 'Failed to export selected candidates' }, { status: 500 })
  }
}
