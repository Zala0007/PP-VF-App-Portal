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
            'Name': application.name,
            'Email': application.email,
            'Contact Number': application.contactNo,
            'College': application.college || 'N/A',
            'Selected Department(s)': selectedDepartments.join(', ') || 'N/A',
            'Review Department': department,
            'Reviewed': review?.reviewed ? 'Yes' : 'No',
            'Selection Status': review?.selectionStatus || 'Pending',
            'Application Type': application.applicationType,
            'Preferred Subjects': application.preferredSubjects || 'N/A',
            'Area of Interest': application.areaOfInterest || 'N/A',
            'Resume File': application.resumeFile || 'N/A',
            'Submitted Date': new Date(application.dateTimeOfSubmit).toLocaleString('en-IN')
          }
        })
      })

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No department applications found' }, { status: 404 })
    }

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(rows)
    worksheet['!cols'] = [
      { wch: 16 }, { wch: 26 }, { wch: 32 }, { wch: 16 }, { wch: 36 },
      { wch: 45 }, { wch: 38 }, { wch: 12 }, { wch: 22 }, { wch: 22 },
      { wch: 35 }, { wch: 35 }, { wch: 45 }, { wch: 22 }
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
