import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const createExpenseSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().optional(),
  date: z.string().transform((str) => new Date(str)),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createExpenseSchema.parse(body)
    
    // For now, use a hardcoded user ID
    // In production, this would come from authentication
    const userId = 'user_1'
    
    const expense = await db.expense.create({
      data: {
        ...validatedData,
        userId,
      },
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
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')
    
    // For now, use a hardcoded user ID
    const userId = 'user_1'
    
    const expenses = await db.expense.findMany({
      where: {
        userId,
        ...(category && { category }),
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