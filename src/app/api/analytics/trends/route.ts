import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { db as prisma } from '@/lib/db'
import { TrendAnalysis } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'last30days'
    // const groupBy = searchParams.get('groupBy') || 'month' // Future use
    
    // Calculate date ranges based on timeframe
    let periods: Array<{ start: Date; end: Date; label: string }> = []

    switch (timeframe) {
      case 'last7days':
        periods = getLast7DaysPeriods()
        break
      case 'last30days':
        periods = getLast30DaysPeriods()
        break
      case 'last12months':
        periods = getLast12MonthsPeriods()
        break
      default:
        periods = getLast30DaysPeriods()
    }

    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      include: { organization: true }
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const trends: TrendAnalysis[] = []

    for (let i = 0; i < periods.length; i++) {
      const period = periods[i]
      const previousPeriod = periods[i - 1]

      // Get expenses for current period
      const expenses = await prisma.expense.findMany({
        where: {
          user: { organizationId: user.organizationId },
          date: {
            gte: period.start,
            lt: period.end
          }
        }
      })

      const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
      const transactionCount = expenses.length
      const averageAmount = transactionCount > 0 ? totalAmount / transactionCount : 0

      let previousPeriodData: { totalAmount: number; percentageChange: number } | undefined

      if (previousPeriod) {
        const previousExpenses = await prisma.expense.findMany({
          where: {
            user: { organizationId: user.organizationId },
            date: {
              gte: previousPeriod.start,
              lt: previousPeriod.end
            }
          }
        })

        const previousTotalAmount = previousExpenses.reduce((sum, expense) => sum + expense.amount, 0)
        const percentageChange = previousTotalAmount > 0 
          ? ((totalAmount - previousTotalAmount) / previousTotalAmount) * 100 
          : 0

        previousPeriodData = {
          totalAmount: previousTotalAmount,
          percentageChange
        }
      }

      trends.push({
        period: period.label,
        totalExpenses: expenses.length,
        totalAmount,
        averageAmount,
        transactionCount,
        previousPeriod: previousPeriodData
      })
    }

    return NextResponse.json(trends)
  } catch (error) {
    console.error('Error fetching trend analysis:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getLast7DaysPeriods(): Array<{ start: Date; end: Date; label: string }> {
  const periods = []
  const now = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000))
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const end = new Date(start.getTime() + (24 * 60 * 60 * 1000))
    
    periods.push({
      start,
      end,
      label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })
  }
  
  return periods
}

function getLast30DaysPeriods(): Array<{ start: Date; end: Date; label: string }> {
  const periods = []
  const now = new Date()
  
  // Group by weeks for last 30 days
  for (let i = 3; i >= 0; i--) {
    const endDate = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000))
    const startDate = new Date(endDate.getTime() - (7 * 24 * 60 * 60 * 1000))
    
    periods.push({
      start: startDate,
      end: endDate,
      label: `Week of ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    })
  }
  
  return periods
}

function getLast12MonthsPeriods(): Array<{ start: Date; end: Date; label: string }> {
  const periods = []
  const now = new Date()
  
  for (let i = 11; i >= 0; i--) {
    const year = now.getFullYear()
    const month = now.getMonth() - i
    
    const adjustedDate = new Date(year, month, 1)
    const start = new Date(adjustedDate.getFullYear(), adjustedDate.getMonth(), 1)
    const end = new Date(adjustedDate.getFullYear(), adjustedDate.getMonth() + 1, 1)
    
    periods.push({
      start,
      end,
      label: start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    })
  }
  
  return periods
}