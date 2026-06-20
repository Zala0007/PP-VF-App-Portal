import prisma from '../../../lib/prisma'
import { NextResponse } from 'next/server'
import { sendApplicationReceivedEmail, sendApplicationToDepartmentHods } from '@/lib/email'
import { applicationBelongsToDepartment, LDCE_COLLEGE_NAME, verifyAdminToken, verifyHodToken } from '@/lib/roleAuth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('POST /api/applications body:', body)

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
    
    const created = await prisma.application.create({ data })
    
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

    return NextResponse.json({
      items: filteredItems.slice(skip, skip + take),
      count: filteredItems.length,
      page,
      take,
      role: 'hod',
      department: hodCredential.department
    })
  }

  const [items, count, pending, reviewed, selected, rejected] = await Promise.all([
    prisma.application.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.application.count({ where }),
    prisma.application.count({ where: { ...where, reviewed: false } }),
    prisma.application.count({ where: { ...where, reviewed: true } }),
    prisma.application.count({ where: { ...where, selectionStatus: 'Selected' } }),
    prisma.application.count({ where: { ...where, selectionStatus: 'Rejected' } })
  ])

  return NextResponse.json({
    items,
    count,
    stats: { total: count, pending, reviewed, selected, rejected },
    page,
    take,
    role: 'admin'
  })
}
