import prisma from '../../../../lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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
    const id = parseInt(params.id)
    const body = await request.json()
    
    const vacancy = await prisma.vacancy.update({
      where: { id },
      data: {
        college: body.college,
        department: body.department,
        professorInPractice: body.professorInPractice,
        visitingFaculty: body.visitingFaculty
      }
    })
    
    return NextResponse.json(vacancy)
  } catch (err) {
    console.error('Error updating vacancy:', err)
    return NextResponse.json({ error: 'Failed to update vacancy' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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
    const id = parseInt(params.id)
    await prisma.vacancy.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting vacancy:', err)
    return NextResponse.json({ error: 'Failed to delete vacancy' }, { status: 500 })
  }
}
