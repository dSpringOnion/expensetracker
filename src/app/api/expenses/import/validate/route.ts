import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
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

interface ImportError {
  row: number
  field: string
  message: string
}

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

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })
    }

    let data: ImportRowData[] = []
    const buffer = Buffer.from(await file.arrayBuffer())

    try {
      if (file.name.endsWith('.xlsx')) {
        // Parse Excel file
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        data = XLSX.utils.sheet_to_json(worksheet)
      } else if (file.name.endsWith('.csv')) {
        // Parse CSV file
        const csvText = buffer.toString('utf8')
        data = parse(csvText, { 
          columns: true, 
          skip_empty_lines: true,
          bom: true 
        })
      } else {
        return NextResponse.json({ error: 'Unsupported file format. Please use .xlsx or .csv' }, { status: 400 })
      }
    } catch (parseError) {
      console.error('File parsing error:', parseError)
      return NextResponse.json({ error: 'Failed to parse file. Please check the file format.' }, { status: 400 })
    }

    if (data.length === 0) {
      return NextResponse.json({ error: 'File contains no data' }, { status: 400 })
    }

    if (data.length > 1000) {
      return NextResponse.json({ error: 'Maximum 1000 rows allowed per import' }, { status: 400 })
    }

    // Validate each row
    const errors: ImportError[] = []
    const validRows: (ImportRowData & { date: Date; taxDeductible: boolean; rowNumber: number })[] = []

    for (let i = 0; i < data.length; i++) {
      const rowNumber = i + 2 // +2 because row 1 is header and arrays are 0-indexed
      const row = data[i]

      try {
        // Validate the row structure
        const validatedRow = importRowSchema.parse(row)
        
        // Additional date validation
        const dateStr = validatedRow.Date
        const parsedDate = new Date(dateStr)
        if (isNaN(parsedDate.getTime())) {
          errors.push({
            row: rowNumber,
            field: 'Date',
            message: 'Invalid date format. Use YYYY-MM-DD format.'
          })
          continue
        }

        // Validate amount is reasonable
        if (validatedRow.Amount > 1000000) {
          errors.push({
            row: rowNumber,
            field: 'Amount',
            message: 'Amount seems too large. Please verify.'
          })
          continue
        }

        // Validate tax deductible field
        const taxDeductible = validatedRow['Tax Deductible']
        if (taxDeductible && !['TRUE', 'FALSE', 'true', 'false', ''].includes(taxDeductible)) {
          errors.push({
            row: rowNumber,
            field: 'Tax Deductible',
            message: 'Tax Deductible must be TRUE or FALSE'
          })
          continue
        }

        validRows.push({
          ...validatedRow,
          date: parsedDate,
          taxDeductible: taxDeductible === 'TRUE' || taxDeductible === 'true',
          rowNumber
        })

      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          validationError.errors.forEach(err => {
            errors.push({
              row: rowNumber,
              field: err.path.join('.'),
              message: err.message
            })
          })
        } else {
          errors.push({
            row: rowNumber,
            field: 'General',
            message: 'Validation failed'
          })
        }
      }
    }

    // Return validation results
    return NextResponse.json({
      totalRows: data.length,
      validRows: validRows.length,
      errors,
      data: validRows.slice(0, 5) // Return first 5 valid rows as preview
    })

  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 })
  }
}