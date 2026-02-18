import prisma from '../../../../lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const applicationId = params.id
  try {
    const item = await prisma.application.findUnique({ where: { applicationId } })
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    // Parse JSON string fields back to arrays
    const parsedItem = {
      ...item,
      timeSlotDay: item.timeSlotDay ? JSON.parse(item.timeSlotDay) : null,
      timeSlotPeriod: item.timeSlotPeriod ? JSON.parse(item.timeSlotPeriod) : null,
      department: item.department ? JSON.parse(item.department) : null
    }
    
    return NextResponse.json(parsedItem)
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const applicationId = params.id
  try {
    const body = await request.json()
    const { reviewed } = body
    
    const updated = await prisma.application.update({
      where: { applicationId },
      data: { reviewed }
    })
    
    return NextResponse.json(updated)
  } catch (err) {
    console.error('PATCH error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
