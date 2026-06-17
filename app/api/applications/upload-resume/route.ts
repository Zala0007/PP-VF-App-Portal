import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const MAX_FILE_SIZE = 500 * 1024 // 500 KB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file size (500KB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size must be less than 500 KB. Current size: ${(file.size / 1024).toFixed(2)} KB` },
        { status: 400 }
      )
    }

    // Validate file type - allow PDF and common document formats
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF, DOC, DOCX, and TXT files are allowed' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'resumes')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}-${sanitizedFileName}`
    const filePath = join(uploadDir, fileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return the file path to be stored in the database
    const resumePath = `/uploads/resumes/${fileName}`

    return NextResponse.json({
      success: true,
      resumePath,
      fileName: file.name,
      fileSize: file.size
    }, { status: 201 })
  } catch (error) {
    console.error('Error uploading resume:', error)
    return NextResponse.json(
      { error: 'Failed to upload resume' },
      { status: 500 }
    )
  }
}
