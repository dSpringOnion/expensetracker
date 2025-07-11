import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { db as prisma } from '@/lib/db'
import * as XLSX from 'xlsx'
import { parse } from 'csv-parse/sync'
import { z } from 'zod'

const importRowSchema = z.object({
  Date: z.string().min(1, 'Date is required'),
  Title: z.string().min(1, 'Title is required'),
  Amount: z.coerce.number().positive('Amount must be positive'),
  Category: z.string().min(1, 'Category is required'),
  Business: z.string().min(1, 'Business is required'),
  Location: z.string().min(1, 'Location is required'),
  Vendor: z.string().optional(),
  'Expense Code': z.string().optional(),
  Description: z.string().optional(),
  'Tax Deductible': z.string().optional(),
})

type ImportRowData = z.infer<typeof importRowSchema>

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    let data: ImportRowData[] = []
    const buffer = Buffer.from(await file.arrayBuffer())

    try {
      if (file.name.endsWith('.xlsx')) {
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        data = XLSX.utils.sheet_to_json(worksheet)
      } else if (file.name.endsWith('.csv')) {
        const csvText = buffer.toString('utf8')
        data = parse(csvText, { 
          columns: true, 
          skip_empty_lines: true,
          bom: true 
        })
      } else {
        return NextResponse.json({ error: 'Unsupported file format' }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ error: 'Failed to parse file' }, { status: 400 })
    }

    if (data.length === 0) {
      return NextResponse.json({ error: 'File contains no data' }, { status: 400 })
    }

    if (data.length > 1000) {
      return NextResponse.json({ error: 'Maximum 1000 rows allowed per import' }, { status: 400 })
    }

    // Process rows and create expenses
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    }

    // Cache for businesses and locations to avoid repeated DB queries
    const businessCache = new Map<string, string>()
    const locationCache = new Map<string, string>()

    for (let i = 0; i < data.length; i++) {
      const rowNumber = i + 2
      const row = data[i]

      try {
        // Validate row
        const validatedRow = importRowSchema.parse(row)
        
        // Parse date
        const date = new Date(validatedRow.Date)
        if (isNaN(date.getTime())) {
          results.failed++
          results.errors.push(`Row ${rowNumber}: Invalid date format`)
          continue
        }

        // Parse tax deductible
        const taxDeductible = validatedRow['Tax Deductible']
        const isTaxDeductible = taxDeductible === 'TRUE' || taxDeductible === 'true'

        // Find or create business
        let businessId = businessCache.get(validatedRow.Business)
        if (!businessId) {
          let business = await prisma.business.findFirst({
            where: {
              name: validatedRow.Business,
              organizationId: user.organization.id
            }
          })

          if (!business) {
            business = await prisma.business.create({
              data: {
                name: validatedRow.Business,
                organizationId: user.organization.id
              }
            })
          }
          
          businessId = business.id
          businessCache.set(validatedRow.Business, businessId)
        }

        // Find or create location
        const locationKey = `${validatedRow.Business}:${validatedRow.Location}`
        let locationId = locationCache.get(locationKey)
        if (!locationId) {
          let location = await prisma.location.findFirst({
            where: {
              name: validatedRow.Location,
              businessId: businessId
            }
          })

          if (!location) {
            location = await prisma.location.create({
              data: {
                name: validatedRow.Location,
                businessId: businessId
              }
            })
          }
          
          locationId = location.id
          locationCache.set(locationKey, locationId)
        }

        // Create expense
        await prisma.expense.create({
          data: {
            title: validatedRow.Title,
            amount: validatedRow.Amount,
            category: validatedRow.Category,
            categories: [validatedRow.Category],
            description: validatedRow.Description || '',
            date,
            businessId,
            locationId,
            vendorName: validatedRow.Vendor || '',
            expenseCode: validatedRow['Expense Code'] || '',
            taxDeductible: isTaxDeductible,
            userId: user.id
          }
        })

        results.successful++

      } catch (error) {
        results.failed++
        if (error instanceof z.ZodError) {
          const fieldErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
          results.errors.push(`Row ${rowNumber}: ${fieldErrors}`)
        } else {
          console.error(`Row ${rowNumber} error:`, error)
          results.errors.push(`Row ${rowNumber}: Processing failed`)
        }
      }
    }

    return NextResponse.json({
      count: results.successful,
      successful: results.successful,
      failed: results.failed,
      errors: results.errors.slice(0, 10) // Limit error messages
    })

  } catch (error) {
    console.error('Import processing error:', error)
    return NextResponse.json({ error: 'Import processing failed' }, { status: 500 })
  }
}