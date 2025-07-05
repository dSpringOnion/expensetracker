import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${randomUUID()}.${fileExtension}`
    
    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    
    try {
      await writeFile(join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()))
    } catch {
      // Try to create directory and retry
      const { mkdir } = await import('fs/promises')
      await mkdir(uploadDir, { recursive: true })
      await writeFile(join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()))
    }

    const fileUrl = `/uploads/${fileName}`
    
    // In production, you would integrate with an OCR service here
    // For now, return mock extracted data
    const mockOcrData = {
      title: 'Receipt',
      amount: 0,
      category: 'Other',
      date: new Date().toISOString().split('T')[0],
      description: 'Extracted from receipt image'
    }

    return NextResponse.json({
      url: fileUrl,
      extractedData: mockOcrData,
    })
  } catch (error) {
    console.error('Upload failed:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}