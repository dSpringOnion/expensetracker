import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recurringExpenseId = params.id

    // Verify recurring expense belongs to user
    const recurringExpense = await db.recurringExpense.findFirst({
      where: {
        id: recurringExpenseId,
        userId: token.sub,
        isActive: true
      }
    })

    if (!recurringExpense) {
      return NextResponse.json({ error: 'Recurring expense not found' }, { status: 404 })
    }

    // Check if it's time to generate the expense
    const now = new Date()
    if (recurringExpense.nextDueDate > now) {
      return NextResponse.json({ 
        error: 'Expense is not due yet', 
        nextDueDate: recurringExpense.nextDueDate 
      }, { status: 400 })
    }

    // Check if end date has passed
    if (recurringExpense.endDate && now > recurringExpense.endDate) {
      return NextResponse.json({ error: 'Recurring expense has ended' }, { status: 400 })
    }

    // Create the expense
    const expense = await db.expense.create({
      data: {
        title: recurringExpense.title,
        amount: recurringExpense.amount,
        category: recurringExpense.category,
        categories: recurringExpense.categories,
        description: recurringExpense.description,
        date: now,
        expenseCode: recurringExpense.expenseCode,
        taxDeductible: recurringExpense.taxDeductible,
        vendorName: recurringExpense.vendorName,
        approvalStatus: 'auto_approved',
        userId: recurringExpense.userId,
        businessId: recurringExpense.businessId,
        locationId: recurringExpense.locationId,
        recurringExpenseId: recurringExpense.id
      }
    })

    // Calculate next due date
    const nextDueDate = calculateNextDueDate(
      recurringExpense.nextDueDate,
      recurringExpense.frequency,
      recurringExpense.dayOfMonth || undefined
    )

    // Update the recurring expense with the new next due date
    await db.recurringExpense.update({
      where: { id: recurringExpenseId },
      data: { nextDueDate }
    })

    return NextResponse.json({ 
      expense, 
      nextDueDate,
      message: 'Expense generated successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('Recurring expense generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateNextDueDate(
  currentDueDate: Date,
  frequency: string,
  dayOfMonth?: number
  // dayOfWeek parameter removed as not currently used
): Date {
  const nextDue = new Date(currentDueDate)

  switch (frequency) {
    case 'daily':
      nextDue.setDate(nextDue.getDate() + 1)
      break
    
    case 'weekly':
      nextDue.setDate(nextDue.getDate() + 7)
      break
    
    case 'monthly':
      nextDue.setMonth(nextDue.getMonth() + 1)
      if (dayOfMonth !== undefined) {
        nextDue.setDate(dayOfMonth)
      }
      break
    
    case 'quarterly':
      nextDue.setMonth(nextDue.getMonth() + 3)
      if (dayOfMonth !== undefined) {
        nextDue.setDate(dayOfMonth)
      }
      break
    
    case 'yearly':
      nextDue.setFullYear(nextDue.getFullYear() + 1)
      if (dayOfMonth !== undefined) {
        nextDue.setDate(dayOfMonth)
      }
      break
  }

  return nextDue
}