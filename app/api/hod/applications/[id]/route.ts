import prisma from '@/lib/prisma'
import { applicationBelongsToDepartment, getApplicationReviewDepartments, LDCE_COLLEGE_NAME, parseDepartments, verifyHodToken } from '@/lib/roleAuth'
import { NextResponse } from 'next/server'
import { getDepartmentHodEmail } from '@/lib/collegeEmails'

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
    const { reviewed, selectionStatus, statusDepartment } = body

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

    const reviewDepartments = getApplicationReviewDepartments(
      application.department,
      credential.department
    )
    const reviewDepartment = typeof statusDepartment === 'string'
      ? statusDepartment
      : reviewDepartments.length === 1
        ? reviewDepartments[0]
        : ''

    if (!reviewDepartment || !reviewDepartments.includes(reviewDepartment)) {
      return NextResponse.json({ error: 'A valid application department is required' }, { status: 400 })
    }

    const departmentReview = await prisma.applicationDepartmentReview.findUnique({
      where: {
        applicationId_department: {
          applicationId: id,
          department: reviewDepartment
        }
      }
    })

    const data: { reviewed?: boolean; selectionStatus?: string } = {}

    if (typeof reviewed === 'boolean') {
      data.reviewed = reviewed
      if (!reviewed) {
        data.selectionStatus = 'Pending'
      }
    }

    if (
      typeof selectionStatus === 'string' &&
      ['Pending', 'Shortlisted for Interview', 'Rejected', 'Selected'].includes(selectionStatus)
    ) {
      const nextReviewed = typeof reviewed === 'boolean'
        ? reviewed
        : departmentReview?.reviewed ?? false

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

    const updatedReview = await prisma.applicationDepartmentReview.upsert({
      where: {
        applicationId_department: {
          applicationId: id,
          department: reviewDepartment
        }
      },
      create: {
        applicationId: id,
        department: reviewDepartment,
        reviewed: data.reviewed ?? false,
        selectionStatus: data.selectionStatus ?? 'Pending'
      },
      update: data
    })

    return NextResponse.json({
      ...application,
      reviewed: updatedReview.reviewed,
      selectionStatus: updatedReview.selectionStatus,
      department: parseDepartments(application.department),
      statusDepartment: reviewDepartment,
      senderEmail: getDepartmentHodEmail(credential.department)
    })
  } catch (error) {
    console.error('HOD PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update application status' }, { status: 500 })
  }
}
