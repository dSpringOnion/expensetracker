import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { db as prisma } from '@/lib/db'
import { CustomReportData, CustomReportFilters } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const filters: CustomReportFilters = await request.json()

    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      include: { organization: true }
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Build expense query filters
    const expenseFilters: Record<string, unknown> = {
      user: { organizationId: user.organizationId },
      date: {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end
      }
    }

    if (filters.categories && filters.categories.length > 0) {
      expenseFilters.category = { in: filters.categories }
    }
    if (filters.businesses && filters.businesses.length > 0) {
      expenseFilters.businessId = { in: filters.businesses }
    }
    if (filters.locations && filters.locations.length > 0) {
      expenseFilters.locationId = { in: filters.locations }
    }
    if (filters.vendors && filters.vendors.length > 0) {
      expenseFilters.vendorName = { in: filters.vendors }
    }
    if (filters.minAmount !== undefined) {
      expenseFilters.amount = { ...(expenseFilters.amount as Record<string, unknown> || {}), gte: filters.minAmount }
    }
    if (filters.maxAmount !== undefined) {
      expenseFilters.amount = { ...(expenseFilters.amount as Record<string, unknown> || {}), lte: filters.maxAmount }
    }
    if (filters.taxDeductibleOnly) {
      expenseFilters.taxDeductible = true
    }

    // Get expenses with related data
    const expenses = await prisma.expense.findMany({
      where: expenseFilters as Record<string, unknown>,
      include: {
        business: true,
        location: true,
        user: true
      },
      orderBy: filters.sortBy === 'date' ? { date: filters.sortOrder || 'desc' } :
               filters.sortBy === 'amount' ? { amount: filters.sortOrder || 'desc' } :
               filters.sortBy === 'category' ? { category: filters.sortOrder || 'asc' } :
               { date: 'desc' }
    })

    // Calculate summary
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const transactionCount = expenses.length
    const averageAmount = transactionCount > 0 ? totalAmount / transactionCount : 0

    const summary = {
      totalAmount,
      transactionCount,
      averageAmount,
      dateRange: filters.dateRange
    }

    // Group data based on groupBy parameter
    const groupedData = groupExpenses(expenses, filters.groupBy || 'category')

    // Calculate trend data (simplified for this implementation)
    const trendData = calculateTrendData(expenses)

    // Top categories
    const categoryMap = new Map<string, { amount: number; count: number }>()
    expenses.forEach(expense => {
      const current = categoryMap.get(expense.category) || { amount: 0, count: 0 }
      categoryMap.set(expense.category, {
        amount: current.amount + expense.amount,
        count: current.count + 1
      })
    })

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        trend: 'stable' as const,
        averagePerTransaction: data.count > 0 ? data.amount / data.count : 0,
        transactionCount: data.count
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)

    // Top vendors
    const vendorMap = new Map<string, { amount: number; count: number; lastDate: Date }>()
    expenses.forEach(expense => {
      if (!expense.vendorName) return
      
      const current = vendorMap.get(expense.vendorName) || { 
        amount: 0, 
        count: 0, 
        lastDate: expense.date 
      }
      vendorMap.set(expense.vendorName, {
        amount: current.amount + expense.amount,
        count: current.count + 1,
        lastDate: expense.date > current.lastDate ? expense.date : current.lastDate
      })
    })

    const topVendors = Array.from(vendorMap.entries())
      .map(([vendorName, data]) => ({
        vendorName,
        totalAmount: data.amount,
        transactionCount: data.count,
        averageAmount: data.count > 0 ? data.amount / data.count : 0,
        lastTransactionDate: data.lastDate,
        topCategories: [], // Simplified for this implementation
        trend: 'stable' as const
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10)

    const reportData: CustomReportData = {
      summary,
      groupedData,
      trendData,
      topCategories,
      topVendors
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error generating custom report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function groupExpenses(expenses: Array<Record<string, unknown>>, groupBy: string) {
  const grouped = new Map<string, { amount: number; count: number }>()

  expenses.forEach(expense => {
    let key: string

    switch (groupBy) {
      case 'category':
        key = String(expense.category || 'Uncategorized')
        break
      case 'location':
        key = expense.location ? String((expense.location as Record<string, unknown>).name) : 'No Location'
        break
      case 'vendor':
        key = String(expense.vendorName || 'No Vendor')
        break
      case 'month':
        key = new Date(String(expense.date)).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        break
      case 'week':
        const date = new Date(String(expense.date))
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
        key = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        break
      case 'day':
        key = new Date(String(expense.date)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        break
      default:
        key = String(expense.category || 'Uncategorized')
    }

    const current = grouped.get(key) || { amount: 0, count: 0 }
    grouped.set(key, {
      amount: current.amount + Number(expense.amount),
      count: current.count + 1
    })
  })

  const total = Array.from(grouped.values()).reduce((sum, item) => sum + item.amount, 0)

  return Array.from(grouped.entries())
    .map(([label, data]) => ({
      label,
      amount: data.amount,
      transactionCount: data.count,
      percentage: total > 0 ? (data.amount / total) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount)
}

function calculateTrendData(expenses: Array<Record<string, unknown>>) {
  // Simplified trend calculation - group by week
  const weeklyData = new Map<string, { amount: number; count: number }>()

  expenses.forEach(expense => {
    const date = new Date(String(expense.date))
    const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
    const weekKey = weekStart.toISOString().split('T')[0]

    const current = weeklyData.get(weekKey) || { amount: 0, count: 0 }
    weeklyData.set(weekKey, {
      amount: current.amount + Number(expense.amount),
      count: current.count + 1
    })
  })

  return Array.from(weeklyData.entries())
    .map(([week, data]) => ({
      period: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      totalExpenses: data.count,
      totalAmount: data.amount,
      averageAmount: data.count > 0 ? data.amount / data.count : 0,
      transactionCount: data.count
    }))
    .sort((a, b) => a.period.localeCompare(b.period))
}