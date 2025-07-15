import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { db } from '@/lib/db'

export async function PUT(
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
    const data = await request.json()

    // Verify recurring expense belongs to user
    const existingRecurringExpense = await db.recurringExpense.findFirst({
      where: {
        id: recurringExpenseId,
        userId: token.sub
      }
    })

    if (!existingRecurringExpense) {
      return NextResponse.json({ error: 'Recurring expense not found' }, { status: 404 })
    }

    const recurringExpense = await db.recurringExpense.update({
      where: { id: recurringExpenseId },
      data: {
        title: data.title,
        amount: data.amount,
        category: data.category,
        categories: data.categories,
        description: data.description,
        frequency: data.frequency,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : undefined,
        dayOfMonth: data.dayOfMonth,
        dayOfWeek: data.dayOfWeek,
        expenseCode: data.expenseCode,
        taxDeductible: data.taxDeductible,
        vendorName: data.vendorName,
        autoCreate: data.autoCreate,
        isActive: data.isActive,
        businessId: data.businessId,
        locationId: data.locationId
      },
      include: {
        business: true,
        location: true
      }
    })

    return NextResponse.json(recurringExpense)
  } catch (error) {
    console.error('Recurring expense update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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
    const existingRecurringExpense = await db.recurringExpense.findFirst({
      where: {
        id: recurringExpenseId,
        userId: token.sub
      }
    })

    if (!existingRecurringExpense) {
      return NextResponse.json({ error: 'Recurring expense not found' }, { status: 404 })
    }

    await db.recurringExpense.delete({
      where: { id: recurringExpenseId }
    })

    return NextResponse.json({ message: 'Recurring expense deleted successfully' })
  } catch (error) {
    console.error('Recurring expense deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}