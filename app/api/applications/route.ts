import prisma from '../../../lib/prisma'
import { NextResponse } from 'next/server'
import { sendApplicationReceivedEmail, sendApplicationToDepartmentHods } from '@/lib/email'
import { applicationBelongsToDepartment, getApplicationReviewDepartments, getHodDepartmentAliases, LDCE_COLLEGE_NAME, parseDepartments, verifyAdminToken, verifyHodToken } from '@/lib/roleAuth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.resumeFile) {
      return NextResponse.json(
        { error: 'Resume upload is required' },
        { status: 400 }
      )
    }
    
    // Generate custom application ID
    const currentYear = new Date().getFullYear()
    const idPrefix = `VF${currentYear}`

    // IDs for the current intake start at VF20260030. Use the highest existing
    // sequence rather than a count so deleting an application cannot reuse an ID.
    const currentYearApplications = await prisma.application.findMany({
      where: {
        applicationId: { startsWith: idPrefix }
      },
      select: { applicationId: true }
    })

    const highestSequence = currentYearApplications.reduce((highest, application) => {
      const sequence = Number(application.applicationId.slice(idPrefix.length))
      return Number.isInteger(sequence) ? Math.max(highest, sequence) : highest
    }, 29)
    const sequenceNumber = String(highestSequence + 1).padStart(4, '0')
    const applicationId = `${idPrefix}${sequenceNumber}`
    
    // Convert array fields to JSON strings
    const data = {
      ...body,
      applicationId,
      timeSlotDay: body.timeSlotDay ? JSON.stringify(body.timeSlotDay) : null,
      timeSlotPeriod: body.timeSlotPeriod ? JSON.stringify(body.timeSlotPeriod) : null,
      department: body.department ? JSON.stringify(body.department) : null
    }
    
    const selectedDepartments: string[] = Array.isArray(body.department)
      ? body.department.filter((department: unknown) => typeof department === 'string') as string[]
      : []

    const created = await prisma.$transaction(async (transaction) => {
      const application = await transaction.application.create({ data })

      if (selectedDepartments.length > 0) {
        await transaction.applicationDepartmentReview.createMany({
          data: [...new Set(selectedDepartments)].map((department) => ({
            applicationId: application.applicationId,
            department,
            reviewed: false,
            selectionStatus: 'Pending'
          })),
          skipDuplicates: true
        })
      }

      return application
    })
    
    // Send confirmation email to applicant
    try {
      await sendApplicationReceivedEmail(
        created.email,
        created.name,
        created.applicationId,
        created.applicationType,
        created.department
      )
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the application creation if email fails
    }

    // Send application PDF to respective department HOD(s)
    try {
      await sendApplicationToDepartmentHods(created)
    } catch (emailError) {
      console.error('Failed to send application to HOD:', emailError)
      // Don't fail the application creation if email fails
    }

    return NextResponse.json(created)
  } catch (err) {
    console.error('Error creating application:', err)
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const adminToken = request.headers.get('x-admin-token')
  const hodToken = request.headers.get('x-hod-token')
  const isAdmin = verifyAdminToken(adminToken)
  const hodCredential = verifyHodToken(hodToken)

  if (!isAdmin && !hodCredential) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const take = parseInt(url.searchParams.get('take') || '20')

  const skip = (page - 1) * take
  const where: any = hodCredential ? { college: LDCE_COLLEGE_NAME } : {}
  const appType = url.searchParams.get('applicationType')
  if (appType) where.applicationType = appType
  const dept = url.searchParams.get('department')
  if (dept) where.department = dept
  const timeSlot = url.searchParams.get('timeSlotPeriod')
  if (timeSlot) where.timeSlotPeriod = timeSlot

  if (hodCredential) {
    const allItems = await prisma.application.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    const filteredItems = allItems.filter((application) =>
      applicationBelongsToDepartment(application.department, hodCredential.department)
    )
    const departmentReviews = await prisma.applicationDepartmentReview.findMany({
      where: {
        department: { in: getHodDepartmentAliases(hodCredential.department) },
        applicationId: { in: filteredItems.map((application) => application.applicationId) }
      }
    })
    const itemsWithDepartmentStatus = filteredItems.flatMap((application) =>
      getApplicationReviewDepartments(application.department, hodCredential.department)
        .map((reviewDepartment) => {
          const departmentReview = departmentReviews.find(
            (review) =>
              review.applicationId === application.applicationId &&
              review.department === reviewDepartment
          )

          return {
            ...application,
            statusDepartment: reviewDepartment,
            reviewed: departmentReview?.reviewed ?? false,
            selectionStatus: departmentReview?.selectionStatus ?? 'Pending'
          }
        })
    )

    return NextResponse.json({
      items: itemsWithDepartmentStatus.slice(skip, skip + take),
      count: itemsWithDepartmentStatus.length,
      page,
      take,
      role: 'hod',
      department: hodCredential.department
    })
  }

  const [applications, count, pending, reviewed, selected, rejected] = await Promise.all([
    prisma.application.findMany({
      where,
      include: { departmentReviews: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    }),
    prisma.application.count({ where }),
    prisma.applicationDepartmentReview.count({
      where: { reviewed: false, application: where }
    }),
    prisma.applicationDepartmentReview.count({
      where: { reviewed: true, application: where }
    }),
    prisma.applicationDepartmentReview.count({
      where: { selectionStatus: 'Selected', application: where }
    }),
    prisma.applicationDepartmentReview.count({
      where: { selectionStatus: 'Rejected', application: where }
    })
  ])
  const items = applications.flatMap((application) => {
    const selectedDepartments = parseDepartments(application.department)
    const { departmentReviews, ...applicationData } = application

    return selectedDepartments.map((statusDepartment) => {
      const departmentReview = departmentReviews.find(
        (review) => review.department === statusDepartment
      )

      return {
        ...applicationData,
        department: [statusDepartment],
        statusDepartment,
        reviewed: departmentReview?.reviewed ?? false,
        selectionStatus: departmentReview?.selectionStatus ?? 'Pending'
      }
    })
  })

  return NextResponse.json({
    items,
    count,
    stats: { total: count, pending, reviewed, selected, rejected },
    page,
    take,
    role: 'admin'
  })
}
