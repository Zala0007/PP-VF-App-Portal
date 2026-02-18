import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const COLLEGES_FILE = path.join(process.cwd(), 'lib', 'colleges.ts')

function readCollegesFile() {
  const content = fs.readFileSync(COLLEGES_FILE, 'utf-8')
  
  // Extract COLLEGE_DEPARTMENTS object - match everything between { and final }
  const match = content.match(/export const COLLEGE_DEPARTMENTS: Record<string, string\[\]> = \{([\s\S]*)\}/)
  if (!match) return {}
  
  const objString = match[1]
  const colleges: Record<string, string[]> = {}
  
  // Match each college block: 'College Name': [ ... ]
  const collegeRegex = /'([^']+)':\s*\[([\s\S]*?)\]/g
  let collegeMatch
  
  while ((collegeMatch = collegeRegex.exec(objString)) !== null) {
    const collegeName = collegeMatch[1]
    const deptsString = collegeMatch[2]
    const depts = deptsString.match(/'([^']+)'/g)?.map(d => d.slice(1, -1)) || []
    colleges[collegeName] = depts
  }
  
  return colleges
}

function writeCollegesFile(colleges: Record<string, string[]>) {
  const sortedColleges = Object.keys(colleges).sort()
  
  const collegesList = sortedColleges.map(c => `  '${c}'`).join(',\n')
  
  const departmentsObj = sortedColleges.map(college => {
    const depts = colleges[college].map(d => `    '${d}'`).join(',\n')
    return `  '${college}': [\n${depts}\n  ]`
  }).join(',\n')
  
  const content = `export const GUJARAT_COLLEGES = [
${collegesList}
] as const

export type College = typeof GUJARAT_COLLEGES[number]

export const COLLEGE_DEPARTMENTS: Record<string, string[]> = {
${departmentsObj}
}
`
  
  fs.writeFileSync(COLLEGES_FILE, content, 'utf-8')
}

export async function GET(request: Request) {
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
    const colleges = readCollegesFile()
    return NextResponse.json({ colleges })
  } catch (error) {
    console.error('Error reading colleges:', error)
    return NextResponse.json({ error: 'Failed to read colleges' }, { status: 500 })
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
    const { collegeName, departments } = await request.json()
    const colleges = readCollegesFile()
    
    colleges[collegeName] = departments
    writeCollegesFile(colleges)
    
    return NextResponse.json({ colleges })
  } catch (error) {
    console.error('Error saving college:', error)
    return NextResponse.json({ error: 'Failed to save college' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
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
    const { collegeName } = await request.json()
    const colleges = readCollegesFile()
    
    delete colleges[collegeName]
    writeCollegesFile(colleges)
    
    return NextResponse.json({ colleges })
  } catch (error) {
    console.error('Error deleting college:', error)
    return NextResponse.json({ error: 'Failed to delete college' }, { status: 500 })
  }
}
