import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import * as XLSX from 'xlsx'
import { stringify } from 'csv-stringify/sync'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'xlsx'

    // Template data with example row
    const templateData = [
      {
        Date: '2025-07-10',
        Title: 'Coffee supplies',
        Amount: 25.50,
        Category: 'Food & Beverage Inventory',
        Business: 'Test Coffee Shop',
        Location: 'Main Branch',
        Vendor: 'Coffee Bean Co',
        'Expense Code': 'EXP-2025-001',
        Description: 'Monthly coffee supplies order',
        'Tax Deductible': 'TRUE',
      }
    ]

    if (format === 'csv') {
      // Generate CSV template
      const csv = stringify(templateData, {
        header: true,
        bom: true, // Add BOM for proper Excel encoding
      })

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="expense-template.csv"',
        },
      })
    } else {
      // Generate Excel template
      const worksheet = XLSX.utils.json_to_sheet(templateData)
      const workbook = XLSX.utils.book_new()
      
      // Set column widths
      const columnWidths = [
        { wch: 12 }, // Date
        { wch: 25 }, // Title
        { wch: 10 }, // Amount
        { wch: 25 }, // Category
        { wch: 20 }, // Business
        { wch: 20 }, // Location
        { wch: 20 }, // Vendor
        { wch: 15 }, // Expense Code
        { wch: 30 }, // Description
        { wch: 15 }, // Tax Deductible
      ]
      worksheet['!cols'] = columnWidths

      // Add data validation and formatting
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:J1')
      
      // Format header row
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
        if (!worksheet[cellRef]) continue
        
        worksheet[cellRef].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '4F46E5' } },
          alignment: { horizontal: 'center' }
        }
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Expense Template')
      
      // Add instructions sheet
      const instructionsData = [
        { Field: 'Date', Required: 'Yes', Format: 'YYYY-MM-DD', Example: '2025-07-10', Notes: 'Date of the expense' },
        { Field: 'Title', Required: 'Yes', Format: 'Text', Example: 'Coffee supplies', Notes: 'Brief description of the expense' },
        { Field: 'Amount', Required: 'Yes', Format: 'Number', Example: '25.50', Notes: 'Positive number, no currency symbol' },
        { Field: 'Category', Required: 'Yes', Format: 'Text', Example: 'Food & Beverage Inventory', Notes: 'Must match existing categories' },
        { Field: 'Business', Required: 'Yes', Format: 'Text', Example: 'Test Coffee Shop', Notes: 'Business name (will be created if new)' },
        { Field: 'Location', Required: 'Yes', Format: 'Text', Example: 'Main Branch', Notes: 'Location name (will be created if new)' },
        { Field: 'Vendor', Required: 'No', Format: 'Text', Example: 'Coffee Bean Co', Notes: 'Vendor or supplier name' },
        { Field: 'Expense Code', Required: 'No', Format: 'Text', Example: 'EXP-2025-001', Notes: 'Internal expense code' },
        { Field: 'Description', Required: 'No', Format: 'Text', Example: 'Monthly coffee supplies order', Notes: 'Additional details' },
        { Field: 'Tax Deductible', Required: 'No', Format: 'TRUE/FALSE', Example: 'TRUE', Notes: 'Whether expense is tax deductible' },
      ]
      
      const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData)
      instructionsSheet['!cols'] = [
        { wch: 15 }, // Field
        { wch: 10 }, // Required
        { wch: 15 }, // Format
        { wch: 25 }, // Example
        { wch: 40 }, // Notes
      ]
      
      XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions')
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="expense-template.xlsx"',
        },
      })
    }
  } catch (error) {
    console.error('Template generation error:', error)
    return NextResponse.json({ error: 'Template generation failed' }, { status: 500 })
  }
}