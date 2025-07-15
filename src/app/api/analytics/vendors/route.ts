import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { db as prisma } from '@/lib/db'
import { VendorAnalysis } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'last30days'
    const limit = parseInt(searchParams.get('limit') || '10')
    
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

    // Get expenses for current period
    const expenses = await prisma.expense.findMany({
      where: {
        user: { organizationId: user.organizationId },
        date: {
          gte: startDate,
          lt: now
        },
        vendorName: { not: null }
      },
      orderBy: { date: 'desc' }
    })

    // Calculate previous period for trend analysis
    const periodLength = now.getTime() - startDate.getTime()
    const previousStartDate = new Date(startDate.getTime() - periodLength)

    const previousExpenses = await prisma.expense.findMany({
      where: {
        user: { organizationId: user.organizationId },
        date: {
          gte: previousStartDate,
          lt: startDate
        },
        vendorName: { not: null }
      }
    })

    // Group by vendor
    const vendorData = new Map<string, {
      totalAmount: number
      transactionCount: number
      lastTransactionDate: Date
      categories: Set<string>
    }>()

    const previousVendorData = new Map<string, { totalAmount: number }>()

    expenses.forEach(expense => {
      if (!expense.vendorName) return

      const vendor = expense.vendorName
      const current = vendorData.get(vendor) || {
        totalAmount: 0,
        transactionCount: 0,
        lastTransactionDate: expense.date,
        categories: new Set<string>()
      }

      current.totalAmount += expense.amount
      current.transactionCount += 1
      current.categories.add(expense.category)
      
      if (expense.date > current.lastTransactionDate) {
        current.lastTransactionDate = expense.date
      }

      vendorData.set(vendor, current)
    })

    previousExpenses.forEach(expense => {
      if (!expense.vendorName) return

      const vendor = expense.vendorName
      const current = previousVendorData.get(vendor) || { totalAmount: 0 }
      current.totalAmount += expense.amount
      previousVendorData.set(vendor, current)
    })

    // Create vendor analysis
    const vendorAnalysis: VendorAnalysis[] = []

    for (const [vendorName, data] of vendorData.entries()) {
      const previousData = previousVendorData.get(vendorName)
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'

      if (previousData) {
        const changePercentage = ((data.totalAmount - previousData.totalAmount) / previousData.totalAmount) * 100
        if (changePercentage > 15) trend = 'increasing'
        else if (changePercentage < -15) trend = 'decreasing'
      } else if (data.totalAmount > 0) {
        trend = 'increasing'
      }

      vendorAnalysis.push({
        vendorName,
        totalAmount: data.totalAmount,
        transactionCount: data.transactionCount,
        averageAmount: data.transactionCount > 0 ? data.totalAmount / data.transactionCount : 0,
        lastTransactionDate: data.lastTransactionDate,
        topCategories: Array.from(data.categories),
        trend
      })
    }

    // Sort by total amount and limit results
    const sortedAnalysis = vendorAnalysis
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limit)

    return NextResponse.json(sortedAnalysis)
  } catch (error) {
    console.error('Error fetching vendor analysis:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}