'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select-radix'
import { Download, FileSpreadsheet, FileText, Calendar, Tag } from 'lucide-react'

export function ExportSection() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx')
  const [filterType, setFilterType] = useState<'month' | 'quarter' | 'year' | 'custom'>('month')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedQuarter, setSelectedQuarter] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')
  const [selectedBusiness, setSelectedBusiness] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ]

  const quarters = [
    { value: 'Q1', label: 'Q1 (Jan-Mar)' },
    { value: 'Q2', label: 'Q2 (Apr-Jun)' },
    { value: 'Q3', label: 'Q3 (Jul-Sep)' },
    { value: 'Q4', label: 'Q4 (Oct-Dec)' },
  ]

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - 5 + i
    return { value: year.toString(), label: year.toString() }
  })

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams()
      params.append('format', exportFormat)

      // Add date filters
      if (filterType === 'month' && selectedMonth && selectedYear) {
        params.append('month', selectedMonth)
        params.append('year', selectedYear)
      } else if (filterType === 'quarter' && selectedQuarter && selectedYear) {
        params.append('quarter', selectedQuarter)
        params.append('year', selectedYear)
      } else if (filterType === 'year' && selectedYear) {
        params.append('year', selectedYear)
      } else if (filterType === 'custom' && customDateFrom && customDateTo) {
        params.append('startDate', customDateFrom)
        params.append('endDate', customDateTo)
      }

      // Add business/category filters
      if (selectedBusiness && selectedBusiness !== 'all') {
        params.append('businessId', selectedBusiness)
      }
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      const response = await fetch(`/api/expenses/export?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `expenses-export.${exportFormat}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`/api/expenses/template?format=${exportFormat}`)
      
      if (!response.ok) {
        throw new Error('Template download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `expense-template.${exportFormat}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Template download failed:', error)
      alert('Template download failed. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Export Format Selection */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Export Format
        </h4>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="xlsx"
              checked={exportFormat === 'xlsx'}
              onChange={(e) => setExportFormat(e.target.value as 'xlsx')}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium">Excel (.xlsx)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="csv"
              checked={exportFormat === 'csv'}
              onChange={(e) => setExportFormat(e.target.value as 'csv')}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium">CSV (.csv)</span>
          </label>
        </div>
      </div>

      {/* Date Filters */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Date Range
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {['month', 'quarter', 'year', 'custom'].map((type) => (
              <label key={type} className="flex items-center space-x-2">
                <input
                  type="radio"
                  value={type}
                  checked={filterType === type}
                  onChange={(e) => setFilterType(e.target.value as 'month' | 'quarter' | 'year' | 'custom')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium capitalize">{type}</span>
              </label>
            ))}
          </div>

          {filterType === 'month' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {filterType === 'quarter' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quarter</Label>
                <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    {quarters.map((quarter) => (
                      <SelectItem key={quarter.value} value={quarter.value}>
                        {quarter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {filterType === 'year' && (
            <div className="w-full max-w-xs">
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {filterType === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Filters */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Additional Filters (Optional)
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Business</Label>
            <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
              <SelectTrigger>
                <SelectValue placeholder="All businesses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All businesses</SelectItem>
                {/* TODO: Load businesses dynamically */}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {/* TODO: Load categories dynamically */}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Actions
        </h4>
        <div className="flex space-x-4">
          <Button
            onClick={handleDownloadTemplate}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Download Template
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : `Export to ${exportFormat.toUpperCase()}`}
          </Button>
        </div>
        <p className="text-xs text-emerald-600 mt-2">
          💡 Download the template first to see the required format for bulk imports
        </p>
      </div>
    </div>
  )
}