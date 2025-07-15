import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { db as prisma } from '@/lib/db'
import { SpendingPattern, LocationSpendingPattern } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'last30days'
    const type = searchParams.get('type') || 'category' // 'category' or 'location'
    
    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (timeframe) {
      case 'last7days':
        startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
        break
      case 'last30days':
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
        break
      case 'last90days':
        startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000))
        break
      case 'last12months':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1)
        break
      default:
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
    }

    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      include: { organization: true }
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    if (type === 'category') {
      const categoryPatterns = await getCategorySpendingPatterns(user.organizationId, startDate, now)
      return NextResponse.json(categoryPatterns)
    } else if (type === 'location') {
      const locationPatterns = await getLocationSpendingPatterns(user.organizationId, startDate, now)
      return NextResponse.json(locationPatterns)
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching spending patterns:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getCategorySpendingPatterns(
  organizationId: string, 
  startDate: Date, 
  endDate: Date
): Promise<SpendingPattern[]> {
  // Get current period expenses grouped by category
  const expenses = await prisma.expense.findMany({
    where: {
      user: { organizationId },
      date: {
        gte: startDate,
        lt: endDate
      }
    }
  })

  // Calculate previous period for trend analysis
  const periodLength = endDate.getTime() - startDate.getTime()
  const previousStartDate = new Date(startDate.getTime() - periodLength)

  const previousExpenses = await prisma.expense.findMany({
    where: {
      user: { organizationId },
      date: {
        gte: previousStartDate,
        lt: startDate
      }
    }
  })

  // Group by category
  const categoryData = new Map<string, { amount: number; count: number }>()
  const previousCategoryData = new Map<string, { amount: number; count: number }>()

  expenses.forEach(expense => {
    const category = expense.category
    const current = categoryData.get(category) || { amount: 0, count: 0 }
    categoryData.set(category, {
      amount: current.amount + expense.amount,
      count: current.count + 1
    })
  })

  previousExpenses.forEach(expense => {
    const category = expense.category
    const current = previousCategoryData.get(category) || { amount: 0, count: 0 }
    previousCategoryData.set(category, {
      amount: current.amount + expense.amount,
      count: current.count + 1
    })
  })

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Create spending patterns
  const patterns: SpendingPattern[] = []

  for (const [category, data] of categoryData.entries()) {
    const previousData = previousCategoryData.get(category)
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'

    if (previousData) {
      const changePercentage = ((data.amount - previousData.amount) / previousData.amount) * 100
      if (changePercentage > 10) trend = 'increasing'
      else if (changePercentage < -10) trend = 'decreasing'
    } else if (data.amount > 0) {
      trend = 'increasing'
    }

    patterns.push({
      category,
      amount: data.amount,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      trend,
      averagePerTransaction: data.count > 0 ? data.amount / data.count : 0,
      transactionCount: data.count
    })
  }

  return patterns.sort((a, b) => b.amount - a.amount)
}

async function getLocationSpendingPatterns(
  organizationId: string, 
  startDate: Date, 
  endDate: Date
): Promise<LocationSpendingPattern[]> {
  const expenses = await prisma.expense.findMany({
    where: {
      user: { organizationId },
      date: {
        gte: startDate,
        lt: endDate
      },
      locationId: { not: null }
    },
    include: {
      location: {
        include: {
          business: true
        }
      }
    }
  })

  const locationData = new Map<string, {
    locationName: string
    businessName: string
    amount: number
    categories: Map<string, number>
  }>()

  expenses.forEach(expense => {
    if (!expense.location) return

    const locationId = expense.locationId!
    const current = locationData.get(locationId) || {
      locationName: expense.location.name,
      businessName: expense.location.business.name,
      amount: 0,
      categories: new Map()
    }

    current.amount += expense.amount
    const categoryAmount = current.categories.get(expense.category) || 0
    current.categories.set(expense.category, categoryAmount + expense.amount)

    locationData.set(locationId, current)
  })

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const patterns: LocationSpendingPattern[] = []

  for (const [locationId, data] of locationData.entries()) {
    const topCategories = Array.from(data.categories.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: data.amount > 0 ? (amount / data.amount) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    patterns.push({
      locationId,
      locationName: data.locationName,
      businessName: data.businessName,
      amount: data.amount,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      topCategories
    })
  }

  return patterns.sort((a, b) => b.amount - a.amount)
}