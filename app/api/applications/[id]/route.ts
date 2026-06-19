import prisma from '../../../../lib/prisma'
import { NextResponse } from 'next/server'
import { applicationBelongsToDepartment, LDCE_COLLEGE_NAME, parseDepartments, verifyAdminToken, verifyHodToken } from '@/lib/roleAuth'
import { getDepartmentHodEmail } from '@/lib/collegeEmails'

function parseJsonField(value: string | null) {
  if (!value) return null

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function canAccessApplication(request: Request, application: { college: string | null; department: string | null }) {
  const adminToken = request.headers.get('x-admin-token')
  if (verifyAdminToken(adminToken)) {
    return true
  }

  const hodToken = request.headers.get('x-hod-token')
  const hodCredential = verifyHodToken(hodToken)

  if (!hodCredential) {
    return false
  }

  return (
    application.college === LDCE_COLLEGE_NAME &&
    applicationBelongsToDepartment(application.department, hodCredential.department)
  )
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: applicationId } = await context.params
    const item = await prisma.application.findUnique({ where: { applicationId } })
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (!canAccessApplication(request, item)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const parsedItem = {
      ...item,
      timeSlotDay: parseJsonField(item.timeSlotDay),
      timeSlotPeriod: parseJsonField(item.timeSlotPeriod),
      department: parseDepartments(item.department)
    }
    
    return NextResponse.json(parsedItem)
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: applicationId } = await context.params
    const body = await request.json()
    const { reviewed, selectionStatus } = body

    const application = await prisma.application.findUnique({
      where: { applicationId }
    })

    if (!application) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const isAdmin = verifyAdminToken(request.headers.get('x-admin-token'))
    const hodCredential = verifyHodToken(request.headers.get('x-hod-token'))
    const canUpdate = isAdmin || Boolean(
      hodCredential &&
      application.college === LDCE_COLLEGE_NAME &&
      applicationBelongsToDepartment(application.department, hodCredential.department)
    )

    if (!canUpdate) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const data: { reviewed?: boolean; selectionStatus?: string } = {}

    if (typeof reviewed === 'boolean') {
      data.reviewed = reviewed
    }

    if (
      typeof selectionStatus === 'string' &&
      ['Pending', 'Shortlisted for Interview', 'Rejected', 'Selected'].includes(selectionStatus)
    ) {
      const nextReviewed = typeof reviewed === 'boolean' ? reviewed : application.reviewed

      if (!nextReviewed) {
        return NextResponse.json(
          { error: 'Application must be reviewed before updating selection status' },
          { status: 400 }
        )
      }

      data.selectionStatus = selectionStatus
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const updated = await prisma.application.update({
      where: { applicationId },
      data
    })
    
    return NextResponse.json({
      ...updated,
      statusDepartment: hodCredential?.department,
      senderEmail: hodCredential ? getDepartmentHodEmail(hodCredential.department) : undefined
    })
  } catch (err) {
    console.error('PATCH error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
