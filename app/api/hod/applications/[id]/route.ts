import prisma from '@/lib/prisma'
import { applicationBelongsToDepartment, LDCE_COLLEGE_NAME, parseDepartments, verifyHodToken } from '@/lib/roleAuth'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const token = request.headers.get('x-hod-token')
  const credential = verifyHodToken(token)

  if (!credential) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await context.params
    const body = await request.json()
    const { reviewed, selectionStatus } = body

    const application = await prisma.application.findUnique({
      where: { applicationId: id }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const isSameCollege = application.college === LDCE_COLLEGE_NAME
    const isSameDepartment = applicationBelongsToDepartment(application.department, credential.department)

    if (!isSameCollege || !isSameDepartment) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
      where: { applicationId: id },
      data
    })

    return NextResponse.json({
      ...updated,
      department: parseDepartments(updated.department)
    })
  } catch (error) {
    console.error('HOD PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update application status' }, { status: 500 })
  }
}
