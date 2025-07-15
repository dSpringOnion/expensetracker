import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { db as prisma } from '@/lib/db'
import { BudgetForecast } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      include: { organization: true }
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get active budgets
    const budgets = await prisma.budget.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true
      }
    })

    const forecasts: BudgetForecast[] = []
    const now = new Date()

    for (const budget of budgets) {
      // Calculate budget period dates
      const periodStart = budget.startDate
      let periodEnd = budget.endDate

      if (!periodEnd) {
        switch (budget.period) {
          case 'monthly':
            periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, periodStart.getDate())
            break
          case 'quarterly':
            periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 3, periodStart.getDate())
            break
          case 'yearly':
            periodEnd = new Date(periodStart.getFullYear() + 1, periodStart.getMonth(), periodStart.getDate())
            break
        }
      }

      // Skip if budget period has ended or no period end date
      if (!periodEnd || periodEnd <= now) continue

      // Get expenses for this budget period
      const expenseFilters: Record<string, unknown> = {
        user: { organizationId: user.organizationId },
        date: {
          gte: periodStart,
          lt: periodEnd
        }
      }

      if (budget.category) {
        expenseFilters.category = budget.category
      }
      if (budget.businessId) {
        expenseFilters.businessId = budget.businessId
      }
      if (budget.locationId) {
        expenseFilters.locationId = budget.locationId
      }

      const expenses = await prisma.expense.findMany({
        where: expenseFilters as Record<string, unknown>
      })

      const currentSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0)

      // Calculate days elapsed and remaining
      const totalDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
      const daysElapsed = Math.ceil((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
      const daysRemaining = Math.max(0, totalDays - daysElapsed)

      // Calculate daily burn rate and projections
      const dailyBurnRate = daysElapsed > 0 ? currentSpending / daysElapsed : 0
      const projectedSpending = dailyBurnRate * totalDays
      const projectedOverage = Math.max(0, projectedSpending - budget.amount)
      const recommendedDailySpending = daysRemaining > 0 ? 
        Math.max(0, (budget.amount - currentSpending) / daysRemaining) : 0

      forecasts.push({
        budgetId: budget.id,
        budgetName: budget.name,
        currentSpending,
        projectedSpending,
        projectedOverage,
        daysRemaining,
        dailyBurnRate,
        recommendedDailySpending
      })
    }

    return NextResponse.json(forecasts)
  } catch (error) {
    console.error('Error fetching budget forecast:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}