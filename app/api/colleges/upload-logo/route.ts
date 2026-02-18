import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Route segment config for file uploads
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const COLLEGES_FILE = path.join(process.cwd(), 'lib', 'colleges.ts')

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
    const formData = await request.formData()
    const logoFile = formData.get('logo') as File
    const collegeName = formData.get('collegeName') as string

    if (!logoFile || !collegeName) {
      return NextResponse.json({ error: 'Missing logo or college name' }, { status: 400 })
    }

    // Get file extension
    const ext = logoFile.name.split('.').pop()?.toLowerCase()
    if (!ext || !['jpg', 'jpeg', 'png'].includes(ext)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPG and PNG allowed.' }, { status: 400 })
    }

    // Create a safe filename based on college name
    const sanitizedName = collegeName
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\s/g, '-')
    
    const fileName = `${sanitizedName}-logo.${ext}`
    const publicPath = path.join(process.cwd(), 'public', fileName)

    // Convert File to Buffer
    const bytes = await logoFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Write file to public folder
    fs.writeFileSync(publicPath, buffer)

    // Update colleges.ts to add logo mapping
    updateCollegeLogos(collegeName, `/${fileName}`)

    return NextResponse.json({ 
      success: true, 
      fileName,
      logoPath: `/${fileName}`
    })
  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 })
  }
}

function updateCollegeLogos(collegeName: string, logoPath: string) {
  const content = fs.readFileSync(COLLEGES_FILE, 'utf-8')
  
  // Check if COLLEGE_LOGOS exists
  const hasLogosConst = content.includes('export const COLLEGE_LOGOS')
  
  if (hasLogosConst) {
    // Find the COLLEGE_LOGOS object and add/update the entry
    const logosMatch = content.match(/(export const COLLEGE_LOGOS: Record<string, string> = \{)([\s\S]*?)(\n\})/)
    if (logosMatch) {
      const before = logosMatch[1]
      let entries = logosMatch[2]
      const after = logosMatch[3]
      
      // Check if college already exists
      const collegeRegex = new RegExp(`'${collegeName.replace(/'/g, "\\'")}':.*?[,\n]`)
      if (collegeRegex.test(entries)) {
        // Update existing entry
        entries = entries.replace(collegeRegex, `'${collegeName}': '${logoPath}',\n`)
      } else {
        // Add new entry at the end
        entries += `  '${collegeName}': '${logoPath}',\n`
      }
      
      const newContent = content.replace(
        /export const COLLEGE_LOGOS: Record<string, string> = \{[\s\S]*?\n\}/,
        `${before}${entries}${after}`
      )
      fs.writeFileSync(COLLEGES_FILE, newContent, 'utf-8')
    }
  } else {
    // COLLEGE_LOGOS doesn't exist, add it at the end
    const newLogosSection = `\n\nexport const COLLEGE_LOGOS: Record<string, string> = {\n  '${collegeName}': '${logoPath}'\n}\n`
    fs.writeFileSync(COLLEGES_FILE, content + newLogosSection, 'utf-8')
  }
}
