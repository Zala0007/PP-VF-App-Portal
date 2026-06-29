import prisma from '../../../../lib/prisma'
import { NextResponse } from 'next/server'
import { applicationBelongsToDepartment, getApplicationReviewDepartments, LDCE_COLLEGE_NAME, parseDepartments, verifyAdminToken, verifyHodToken } from '@/lib/roleAuth'
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

    const hodCredential = verifyHodToken(request.headers.get('x-hod-token'))
    const hodReviewDepartments = hodCredential
      ? getApplicationReviewDepartments(item.department, hodCredential.department)
      : []
    const departmentReview = hodCredential && hodReviewDepartments.length === 1
      ? await prisma.applicationDepartmentReview.findUnique({
          where: {
            applicationId_department: {
              applicationId,
              department: hodReviewDepartments[0]
            }
          }
        })
      : null
    
    const parsedItem = {
      ...item,
      timeSlotDay: parseJsonField(item.timeSlotDay),
      timeSlotPeriod: parseJsonField(item.timeSlotPeriod),
      department: parseDepartments(item.department),
      ...(hodCredential
        ? {
            reviewed: departmentReview?.reviewed ?? false,
            selectionStatus: departmentReview?.selectionStatus ?? 'Pending',
            statusDepartment: hodReviewDepartments.length === 1 ? hodReviewDepartments[0] : undefined
          }
        : {})
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
    const { reviewed, selectionStatus, statusDepartment } = body

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

    if (hodCredential && !isAdmin) {
      const reviewDepartments = getApplicationReviewDepartments(
        application.department,
        hodCredential.department
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
            applicationId,
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
            applicationId,
            department: reviewDepartment
          }
        },
        create: {
          applicationId,
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
        statusDepartment: reviewDepartment,
        senderEmail: getDepartmentHodEmail(hodCredential.department)
      })
    }
    
    const selectedDepartments = parseDepartments(application.department)
    const reviewDepartment = typeof statusDepartment === 'string'
      ? statusDepartment
      : selectedDepartments.length === 1
        ? selectedDepartments[0]
        : ''

    if (!reviewDepartment || !selectedDepartments.includes(reviewDepartment)) {
      return NextResponse.json({ error: 'A valid application department is required' }, { status: 400 })
    }

    const departmentReview = await prisma.applicationDepartmentReview.findUnique({
      where: {
        applicationId_department: {
          applicationId,
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
          applicationId,
          department: reviewDepartment
        }
      },
      create: {
        applicationId,
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
      statusDepartment: reviewDepartment,
      senderEmail: getDepartmentHodEmail(reviewDepartment)
    })
  } catch (err) {
    console.error('PATCH error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
