import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'


const createExpenseSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  category: z.string().min(1),
  categories: z.array(z.string()).optional().default([]),
  description: z.string().optional(),
  date: z.string().transform((str) => new Date(str)),
  businessId: z.string().min(1, 'Business is required'),
  locationId: z.string().min(1, 'Location is required'),
  vendorName: z.string().optional(),
  expenseCode: z.string().optional(),
  taxDeductible: z.boolean().optional().default(true),
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract file if present
    const receiptFile = formData.get('receiptFile') as File | null
    let receiptUrl: string | undefined
    
    if (receiptFile) {
      // Create receipts directory if it doesn't exist
      const receiptsDir = join(process.cwd(), 'public', 'receipts')
      try {
        await mkdir(receiptsDir, { recursive: true })
      } catch {
        // Directory might already exist
      }
      
      // Generate unique filename
      const fileExtension = receiptFile.name.split('.').pop() || 'bin'
      const fileName = `${uuidv4()}.${fileExtension}`
      const filePath = join(receiptsDir, fileName)
      
      // Save file
      const bytes = await receiptFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)
      
      receiptUrl = `/receipts/${fileName}`
    }
    
    // Parse JSON data from form
    const jsonData = formData.get('data') as string
    const expenseData = JSON.parse(jsonData)
    const validatedData = createExpenseSchema.parse(expenseData)
    
    // Get authenticated user
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    const expense = await db.expense.create({
      data: {
        ...validatedData,
        userId,
        receiptUrl,
      },
      include: {
        business: true,
        location: true,
      }
    })
    
    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Failed to create expense:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const businessId = searchParams.get('businessId')
    const locationId = searchParams.get('locationId')
    const approvalStatus = searchParams.get('approvalStatus')
    const limit = searchParams.get('limit')
    
    const expenses = await db.expense.findMany({
      where: {
        userId,
        ...(category && { category }),
        ...(businessId && { businessId }),
        ...(locationId && { locationId }),
        ...(approvalStatus && { approvalStatus }),
      },
      include: {
        business: true,
        location: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        date: 'desc',
      },
      take: limit ? parseInt(limit) : undefined,
    })
    
    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Failed to fetch expenses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}