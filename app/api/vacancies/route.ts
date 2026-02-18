import prisma from '../../../lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const vacancies = await prisma.vacancy.findMany({
      orderBy: { department: 'asc' }
    })
    return NextResponse.json({ vacancies })
  } catch (err) {
    console.error('Error fetching vacancies:', err)
    return NextResponse.json({ error: 'Failed to fetch vacancies' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

  try {
    const body = await request.json()
    const vacancy = await prisma.vacancy.create({ 
      data: {
        college: body.college,
        department: body.department,
        professorInPractice: body.professorInPractice || 0,
        visitingFaculty: body.visitingFaculty || 0
      }
    })
    return NextResponse.json(vacancy)
  } catch (err) {
    console.error('Error creating vacancy:', err)
    return NextResponse.json({ error: 'Failed to create vacancy' }, { status: 500 })
  }
}
