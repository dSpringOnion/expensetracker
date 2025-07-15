'use client'

import React, { useState, useEffect } from 'react'
import { VendorAnalysis, AnalyticsTimeframe } from '@/types'

interface VendorAnalysisProps {
  className?: string
}

const TIMEFRAME_OPTIONS: AnalyticsTimeframe[] = [
  { label: 'Last 7 Days', value: 'last7days' },
  { label: 'Last 30 Days', value: 'last30days' },
  { label: 'Last 90 Days', value: 'last90days' },
  { label: 'Last 12 Months', value: 'last12months' }
]

export default function VendorAnalysisComponent({ className = '' }: VendorAnalysisProps) {
  const [vendors, setVendors] = useState<VendorAnalysis[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<AnalyticsTimeframe>(TIMEFRAME_OPTIONS[1])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchVendors()
  }, [selectedTimeframe])

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/vendors?timeframe=${selectedTimeframe.value}&limit=15`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch vendor data')
      }
      
      const data = await response.json()
      setVendors(data)
      setError('')
    } catch (err) {
      setError('Failed to load vendor analysis')
      console.error('Error fetching vendors:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <span className="text-red-600" title="Spending increased">↗️</span>
      case 'decreasing':
        return <span className="text-green-600" title="Spending decreased">↘️</span>
      default:
        return <span className="text-gray-700" title="Spending stable">→</span>
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDaysSinceLastTransaction = (date: Date) => {
    const now = new Date()
    const lastTransaction = new Date(date)
    const diffTime = Math.abs(now.getTime() - lastTransaction.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">Vendor Analysis</h3>
        
        <select
          value={selectedTimeframe.value}
          onChange={(e) => {
            const timeframe = TIMEFRAME_OPTIONS.find(t => t.value === e.target.value)
            if (timeframe) setSelectedTimeframe(timeframe)
          }}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {TIMEFRAME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-700">Loading vendor analysis...</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-700">{error}</div>
        </div>
      )}

      {!loading && !error && vendors.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-700">No vendor data available for the selected timeframe</div>
          <div className="text-sm text-gray-700 mt-2">
            Add vendor names to your expenses to see vendor analysis
          </div>
        </div>
      )}

      {!loading && !error && vendors.length > 0 && (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {vendors.length}
              </div>
              <div className="text-sm text-gray-700">Active Vendors</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                ${vendors.reduce((sum, v) => sum + v.totalAmount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-700">Total Spending</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                ${(vendors.reduce((sum, v) => sum + v.totalAmount, 0) / Math.max(vendors.length, 1)).toFixed(0)}
              </div>
              <div className="text-sm text-gray-700">Avg per Vendor</div>
            </div>
          </div>

          {/* Vendor List */}
          <div className="space-y-3">
            {vendors.map((vendor, index) => {
              const daysSinceLastTransaction = getDaysSinceLastTransaction(vendor.lastTransactionDate)
              const isRecent = daysSinceLastTransaction <= 7
              const isOld = daysSinceLastTransaction > 30

              return (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{vendor.vendorName}</h4>
                        {getTrendIcon(vendor.trend)}
                        {isRecent && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Recent
                          </span>
                        )}
                        {isOld && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700">
                        <div>
                          <span className="font-medium">Transactions:</span> {vendor.transactionCount}
                        </div>
                        <div>
                          <span className="font-medium">Avg Amount:</span> ${vendor.averageAmount.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Last Transaction:</span> {formatDate(vendor.lastTransactionDate)}
                        </div>
                      </div>
                      
                      {vendor.topCategories.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-700 mb-2">Categories:</div>
                          <div className="flex flex-wrap gap-1">
                            {vendor.topCategories.slice(0, 4).map((category, catIndex) => (
                              <span
                                key={catIndex}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                              >
                                {category}
                              </span>
                            ))}
                            {vendor.topCategories.length > 4 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                +{vendor.topCategories.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-xl font-bold text-gray-900">
                        ${vendor.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-700">
                        {daysSinceLastTransaction === 1 ? '1 day ago' : `${daysSinceLastTransaction} days ago`}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}