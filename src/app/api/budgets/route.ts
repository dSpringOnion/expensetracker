import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { db } from '@/lib/db'
import { CreateBudgetData, BudgetStats, BudgetPeriod } from '@/types'

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
    const includeStats = url.searchParams.get('stats') === 'true'

    const where: Record<string, unknown> = {
      organizationId: user.organizationId,
      isActive: true
    }

    if (businessId) {
      where.businessId = businessId
    }
    if (locationId) {
      where.locationId = locationId
    }

    const budgets = await db.budget.findMany({
      where,
      include: {
        business: true,
        location: true
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!includeStats) {
      return NextResponse.json(budgets)
    }

    // Calculate budget statistics
    const budgetStats: BudgetStats[] = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = new Date(budget.startDate)
        const endDate = budget.endDate ? new Date(budget.endDate) : getEndDateForPeriod(startDate, budget.period)
        
        // Get expenses within budget period and criteria
        const expenseWhere: Record<string, unknown> = {
          user: { organizationId: user.organizationId }, // Filter by organization instead of specific user
          date: {
            gte: startDate,
            lte: endDate
          }
        }

        if (budget.category) {
          expenseWhere.OR = [
            { category: budget.category },
            { categories: { has: budget.category } }
          ]
        }

        if (budget.businessId) {
          expenseWhere.businessId = budget.businessId
        }

        if (budget.locationId) {
          expenseWhere.locationId = budget.locationId
        }

        const expenses = await db.expense.findMany({
          where: expenseWhere,
          select: { amount: true }
        })

        const spentAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
        const remainingAmount = budget.amount - spentAmount
        const percentageUsed = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0
        const isOverBudget = spentAmount > budget.amount
        const alertTriggered = percentageUsed >= (budget.alertThreshold * 100)

        const now = new Date()
        const daysRemaining = endDate > now ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0

        return {
          budgetId: budget.id,
          budgetName: budget.name,
          budgetAmount: budget.amount,
          spentAmount,
          remainingAmount,
          percentageUsed,
          isOverBudget,
          alertTriggered,
          period: budget.period as BudgetPeriod,
          daysRemaining: daysRemaining > 0 ? daysRemaining : undefined
        }
      })
    )

    return NextResponse.json({ budgets, stats: budgetStats })
  } catch (error) {
    console.error('Budget fetch error:', error)
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

    const data: CreateBudgetData = await request.json()

    const budget = await db.budget.create({
      data: {
        name: data.name,
        amount: data.amount,
        period: data.period,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        category: data.category,
        organizationId: user.organizationId,
        businessId: data.businessId,
        locationId: data.locationId,
        alertThreshold: data.alertThreshold || 0.8,
        createdBy: token.sub
      },
      include: {
        business: true,
        location: true
      }
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error('Budget creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getEndDateForPeriod(startDate: Date, period: string): Date {
  const endDate = new Date(startDate)
  
  switch (period) {
    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1)
      break
    case 'quarterly':
      endDate.setMonth(endDate.getMonth() + 3)
      break
    case 'yearly':
      endDate.setFullYear(endDate.getFullYear() + 1)
      break
  }
  
  return endDate
}