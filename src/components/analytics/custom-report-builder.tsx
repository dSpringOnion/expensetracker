'use client'

import React, { useState, useEffect } from 'react'
import { CustomReportData, CustomReportFilters } from '@/types'

interface CustomReportBuilderProps {
  className?: string
}

export default function CustomReportBuilder({ className = '' }: CustomReportBuilderProps) {
  const [reportData, setReportData] = useState<CustomReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // const [businesses, setBusinesses] = useState<Array<{ id: string; name: string }>>([])
  // const [locations, setLocations] = useState<Array<{ id: string; name: string; businessName: string }>>([])
  
  const [filters, setFilters] = useState<CustomReportFilters>({
    dateRange: {
      start: new Date(new Date().getTime() - (30 * 24 * 60 * 60 * 1000)), // 30 days ago
      end: new Date()
    },
    categories: [],
    businesses: [],
    locations: [],
    vendors: [],
    groupBy: 'category',
    sortBy: 'amount',
    sortOrder: 'desc'
  })

  const CATEGORY_OPTIONS = [
    'Food & Beverage Inventory', 'Kitchen Equipment & Supplies', 'Staff Meals & Benefits',
    'Cleaning & Sanitation', 'Utilities (Gas/Electric/Water)', 'Equipment Maintenance',
    'Marketing & Promotion', 'Inventory & Merchandise', 'Store Fixtures & Equipment',
    'Point of Sale Systems', 'Security & Surveillance', 'Store Maintenance',
    'Customer Service', 'Office Supplies & Equipment', 'Professional Development',
    'Client Entertainment', 'Technology & Software', 'Insurance & Legal',
    'Office Supplies', 'Professional Services', 'Insurance', 'Marketing/Advertising',
    'Vehicle/Transportation', 'Utilities', 'Rent & Facilities', 'Other'
  ]

  useEffect(() => {
    fetchBusinessesAndLocations()
  }, [])

  const fetchBusinessesAndLocations = async () => {
    // Future enhancement: fetch businesses and locations for filtering
    // try {
    //   const [businessesRes, locationsRes] = await Promise.all([
    //     fetch('/api/businesses'),
    //     fetch('/api/locations')
    //   ])
    //   
    //   if (businessesRes.ok) {
    //     const businessesData = await businessesRes.json()
    //     setBusinesses(businessesData)
    //   }
    //   
    //   if (locationsRes.ok) {
    //     const locationsData = await locationsRes.json()
    //     setLocations(locationsData)
    //   }
    // } catch (err) {
    //   console.error('Error fetching businesses/locations:', err)
    // }
  }

  const generateReport = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/analytics/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate report')
      }
      
      const data = await response.json()
      setReportData(data)
    } catch (err) {
      setError('Failed to generate report')
      console.error('Error generating report:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!reportData) return

    const headers = ['Label', 'Amount', 'Transaction Count', 'Percentage']
    const rows = reportData.groupedData.map(item => [
      item.label,
      item.amount.toFixed(2),
      item.transactionCount.toString(),
      item.percentage.toFixed(2) + '%'
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expense-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFilterChange = (key: keyof CustomReportFilters, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const toggleArrayFilter = (key: 'categories' | 'businesses' | 'locations' | 'vendors', value: string) => {
    setFilters(prev => {
      const currentArray = prev[key] || []
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      
      return {
        ...prev,
        [key]: newArray
      }
    })
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Filter Section */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Custom Report Builder</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.dateRange.start.toISOString().split('T')[0]}
                onChange={(e) => handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  start: new Date(e.target.value)
                })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={filters.dateRange.end.toISOString().split('T')[0]}
                onChange={(e) => handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  end: new Date(e.target.value)
                })}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Group By */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Group By</label>
            <select
              value={filters.groupBy}
              onChange={(e) => handleFilterChange('groupBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="category">Category</option>
              <option value="location">Location</option>
              <option value="vendor">Vendor</option>
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
            </select>
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Amount Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min amount"
                value={filters.minAmount || ''}
                onChange={(e) => handleFilterChange('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max amount"
                value={filters.maxAmount || ''}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Sort By</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="amount">Amount</option>
                <option value="date">Date</option>
                <option value="category">Category</option>
              </select>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Filter */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">Categories (optional)</label>
          <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map((category) => (
                <label key={category} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.categories?.includes(category) || false}
                    onChange={() => toggleArrayFilter('categories', category)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-900">{category}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={generateReport}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
          
          {reportData && (
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
            >
              Export to CSV
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {reportData && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${reportData.summary.totalAmount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-700">Total Amount</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {reportData.summary.transactionCount}
                </div>
                <div className="text-sm text-gray-700">Transactions</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${reportData.summary.averageAmount.toFixed(2)}
                </div>
                <div className="text-sm text-gray-700">Average Amount</div>
              </div>
            </div>

            {/* Grouped Data */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Breakdown by {filters.groupBy?.charAt(0).toUpperCase() + filters.groupBy?.slice(1)}
              </h4>
              
              <div className="space-y-2">
                {reportData.groupedData.slice(0, 15).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.label}</div>
                      <div className="text-sm text-gray-700">
                        {item.transactionCount} transaction{item.transactionCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ${item.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-700">
                        {item.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!reportData && !loading && !error && (
          <div className="text-center py-8">
            <div className="text-gray-700">Configure filters above and click &quot;Generate Report&quot; to see results</div>
          </div>
        )}
      </div>
    </div>
  )
}