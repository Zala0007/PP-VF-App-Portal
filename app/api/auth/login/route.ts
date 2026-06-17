import { NextResponse } from 'next/server'
import { verifyPortalPassword } from '@/lib/roleAuth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const password = typeof body.password === 'string' ? body.password : ''
    const result = verifyPortalPassword(password)

    if (!result) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
