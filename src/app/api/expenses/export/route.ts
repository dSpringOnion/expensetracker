import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { db as prisma } from '@/lib/db'
import * as XLSX from 'xlsx'
import { stringify } from 'csv-stringify/sync'
import { startOfMonth, endOfMonth, startOfYear, endOfYear, startOfQuarter, endOfQuarter } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'xlsx'
    const month = searchParams.get('month')
    const quarter = searchParams.get('quarter')
    const year = searchParams.get('year')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const businessId = searchParams.get('businessId')
    const category = searchParams.get('category')

    // Build date filter
    let dateFilter: { date?: { gte?: Date; lte?: Date } } = {}
    
    if (startDate && endDate) {
      // Custom date range
      dateFilter = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        }
      }
    } else if (month && year) {
      // Specific month
      const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      dateFilter = {
        date: {
          gte: startOfMonth(monthDate),
          lte: endOfMonth(monthDate),
        }
      }
    } else if (quarter && year) {
      // Specific quarter
      const quarterNum = parseInt(quarter.replace('Q', ''))
      const yearNum = parseInt(year)
      const quarterDate = new Date(yearNum, (quarterNum - 1) * 3, 1)
      dateFilter = {
        date: {
          gte: startOfQuarter(quarterDate),
          lte: endOfQuarter(quarterDate),
        }
      }
    } else if (year) {
      // Entire year
      const yearDate = new Date(parseInt(year), 0, 1)
      dateFilter = {
        date: {
          gte: startOfYear(yearDate),
          lte: endOfYear(yearDate),
        }
      }
    }

    // Build additional filters
    const additionalFilters: { businessId?: string; category?: string } = {}
    if (businessId) {
      additionalFilters.businessId = businessId
    }
    if (category) {
      additionalFilters.category = category
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Fetch expenses with filters
    const expenses = await prisma.expense.findMany({
      where: {
        business: {
          organizationId: user.organization.id,
        },
        ...dateFilter,
        ...additionalFilters,
      },
      include: {
        business: true,
        location: true,
      },
      orderBy: { date: 'desc' }
    })

    // Format data for export
    const exportData = expenses.map(expense => ({
      Date: expense.date.toISOString().split('T')[0],
      Title: expense.title,
      Amount: expense.amount,
      Category: expense.category,
      Business: expense.business?.name || '',
      Location: expense.location?.name || '',
      Vendor: expense.vendorName || '',
      'Expense Code': expense.expenseCode || '',
      Description: expense.description || '',
      'Tax Deductible': expense.taxDeductible ? 'TRUE' : 'FALSE',
    }))

    if (format === 'csv') {
      // Generate CSV
      const csv = stringify(exportData, {
        header: true,
        bom: true, // Add BOM for proper Excel encoding
      })

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="expenses-export.csv"',
        },
      })
    } else {
      // Generate Excel
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      
      // Set column widths
      const columnWidths = [
        { wch: 12 }, // Date
        { wch: 25 }, // Title
        { wch: 10 }, // Amount
        { wch: 20 }, // Category
        { wch: 20 }, // Business
        { wch: 20 }, // Location
        { wch: 20 }, // Vendor
        { wch: 15 }, // Expense Code
        { wch: 30 }, // Description
        { wch: 12 }, // Tax Deductible
      ]
      worksheet['!cols'] = columnWidths

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses')
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="expenses-export.xlsx"',
        },
      })
    }
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}