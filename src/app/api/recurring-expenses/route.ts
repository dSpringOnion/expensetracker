import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { db } from '@/lib/db'
import { CreateRecurringExpenseData } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: token.sub },
      include: { organization: true }
    })

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'User not found or not in organization' }, { status: 404 })
    }

    const url = new URL(request.url)
    const businessId = url.searchParams.get('businessId')
    const locationId = url.searchParams.get('locationId')
    const activeOnly = url.searchParams.get('active') !== 'false'

    const where: Record<string, unknown> = {
      userId: token.sub
    }

    if (activeOnly) {
      where.isActive = true
    }

    if (businessId) {
      where.businessId = businessId
    }
    if (locationId) {
      where.locationId = locationId
    }

    const recurringExpenses = await db.recurringExpense.findMany({
      where,
      include: {
        business: true,
        location: true,
        expenses: {
          orderBy: { createdAt: 'desc' },
          take: 5 // Last 5 generated expenses
        }
      },
      orderBy: { nextDueDate: 'asc' }
    })

    return NextResponse.json(recurringExpenses)
  } catch (error) {
    console.error('Recurring expenses fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: token.sub },
      include: { organization: true }
    })

    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'User not found or not in organization' }, { status: 404 })
    }

    const data: CreateRecurringExpenseData = await request.json()

    const nextDueDate = calculateNextDueDate(
      new Date(data.startDate),
      data.frequency,
      data.dayOfMonth,
      data.dayOfWeek
    )

    const recurringExpense = await db.recurringExpense.create({
      data: {
        title: data.title,
        amount: data.amount,
        category: data.category,
        categories: data.categories || [data.category],
        description: data.description,
        frequency: data.frequency,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        nextDueDate,
        dayOfMonth: data.dayOfMonth,
        dayOfWeek: data.dayOfWeek,
        expenseCode: data.expenseCode,
        taxDeductible: data.taxDeductible ?? true,
        vendorName: data.vendorName,
        autoCreate: data.autoCreate ?? false,
        userId: token.sub,
        businessId: data.businessId,
        locationId: data.locationId
      },
      include: {
        business: true,
        location: true
      }
    })

    return NextResponse.json(recurringExpense, { status: 201 })
  } catch (error) {
    console.error('Recurring expense creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateNextDueDate(
  startDate: Date,
  frequency: string,
  dayOfMonth?: number,
  dayOfWeek?: number
): Date {
  const now = new Date()
  const nextDue = new Date(startDate)

  // If start date is in the future, use it as the next due date
  if (startDate > now) {
    return startDate
  }

  switch (frequency) {
    case 'daily':
      while (nextDue <= now) {
        nextDue.setDate(nextDue.getDate() + 1)
      }
      break
    
    case 'weekly':
      if (dayOfWeek !== undefined) {
        // Set to the specified day of week
        const currentDay = nextDue.getDay()
        const daysToAdd = (dayOfWeek - currentDay + 7) % 7
        nextDue.setDate(nextDue.getDate() + daysToAdd)
      }
      while (nextDue <= now) {
        nextDue.setDate(nextDue.getDate() + 7)
      }
      break
    
    case 'monthly':
      if (dayOfMonth !== undefined) {
        nextDue.setDate(dayOfMonth)
      }
      while (nextDue <= now) {
        nextDue.setMonth(nextDue.getMonth() + 1)
        if (dayOfMonth !== undefined) {
          nextDue.setDate(dayOfMonth)
        }
      }
      break
    
    case 'quarterly':
      if (dayOfMonth !== undefined) {
        nextDue.setDate(dayOfMonth)
      }
      while (nextDue <= now) {
        nextDue.setMonth(nextDue.getMonth() + 3)
        if (dayOfMonth !== undefined) {
          nextDue.setDate(dayOfMonth)
        }
      }
      break
    
    case 'yearly':
      if (dayOfMonth !== undefined) {
        nextDue.setDate(dayOfMonth)
      }
      while (nextDue <= now) {
        nextDue.setFullYear(nextDue.getFullYear() + 1)
        if (dayOfMonth !== undefined) {
          nextDue.setDate(dayOfMonth)
        }
      }
      break
  }

  return nextDue
}