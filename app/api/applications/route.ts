import prisma from '../../../lib/prisma'
import { NextResponse } from 'next/server'
import { sendApplicationReceivedEmail, sendApplicationToPrincipal } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('POST /api/applications body:', body)
    
    // Generate custom application ID
    const currentYear = new Date().getFullYear()
    const typeCode = body.applicationType === 'Professor in Practice' ? 'PP' : 'VF'
    
    // Get count of applications for this year and type
    const yearStart = new Date(currentYear, 0, 1)
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59)
    
    const count = await prisma.application.count({
      where: {
        applicationType: body.applicationType,
        createdAt: {
          gte: yearStart,
          lte: yearEnd
        }
      }
    })
    
    const sequenceNumber = String(count + 1).padStart(4, '0')
    const applicationId = `${currentYear}${typeCode}${sequenceNumber}`
    
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
        created.applicationType
      )
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the application creation if email fails
    }

    // Send application PDF to college principal
    try {
      await sendApplicationToPrincipal(created)
    } catch (emailError) {
      console.error('Failed to send application to principal:', emailError)
      // Don't fail the application creation if email fails
    }

    return NextResponse.json(created)
  } catch (err) {
    console.error('Error creating application:', err)
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  // protect listing with admin token
  const token = request.headers.get('x-admin-token')
  const validPasswords = [
    process.env.ADMIN_PASSWORD_1,
    process.env.ADMIN_PASSWORD_2,
    process.env.ADMIN_PASSWORD_3,
    process.env.ADMIN_PASSWORD_4,
    process.env.ADMIN_PASSWORD_5
  ].filter(Boolean)
  
  if (!token || !validPasswords.includes(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const take = parseInt(url.searchParams.get('take') || '20')

  const skip = (page - 1) * take
  const where: any = {}
  const appType = url.searchParams.get('applicationType')
  if (appType) where.applicationType = appType
  const dept = url.searchParams.get('department')
  if (dept) where.department = dept
  const timeSlot = url.searchParams.get('timeSlotPeriod')
  if (timeSlot) where.timeSlotPeriod = timeSlot

  const [items, count] = await Promise.all([
    prisma.application.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.application.count({ where })
  ])

  return NextResponse.json({ items, count, page, take })
}
