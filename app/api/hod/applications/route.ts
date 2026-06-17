import prisma from '@/lib/prisma'
import { applicationBelongsToDepartment, LDCE_COLLEGE_NAME, parseDepartments, verifyHodToken } from '@/lib/roleAuth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const token = request.headers.get('x-hod-token')
  const credential = verifyHodToken(token)

  if (!credential) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const applications = await prisma.application.findMany({
      where: {
        college: LDCE_COLLEGE_NAME
      },
      orderBy: { createdAt: 'desc' }
    })

    const items = applications
      .filter((application) => applicationBelongsToDepartment(application.department, credential.department))
      .map((application) => ({
        ...application,
        department: parseDepartments(application.department)
      }))

    return NextResponse.json({
      items,
      count: items.length,
      department: credential.department
    })
  } catch (error) {
    console.error('Error fetching HOD applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}
