'use client'

import React, { useState, useEffect } from 'react'
import { SpendingPattern, LocationSpendingPattern, AnalyticsTimeframe } from '@/types'

interface SpendingPatternsProps {
  className?: string
}

const TIMEFRAME_OPTIONS: AnalyticsTimeframe[] = [
  { label: 'Last 7 Days', value: 'last7days' },
  { label: 'Last 30 Days', value: 'last30days' },
  { label: 'Last 90 Days', value: 'last90days' },
  { label: 'Last 12 Months', value: 'last12months' }
]

export default function SpendingPatterns({ className = '' }: SpendingPatternsProps) {
  const [categoryPatterns, setCategoryPatterns] = useState<SpendingPattern[]>([])
  const [locationPatterns, setLocationPatterns] = useState<LocationSpendingPattern[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<AnalyticsTimeframe>(TIMEFRAME_OPTIONS[1])
  const [activeTab, setActiveTab] = useState<'category' | 'location'>('category')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPatterns()
  }, [selectedTimeframe, activeTab])

  const fetchPatterns = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/patterns?timeframe=${selectedTimeframe.value}&type=${activeTab}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch pattern data')
      }
      
      const data = await response.json()
      
      if (activeTab === 'category') {
        setCategoryPatterns(data)
      } else {
        setLocationPatterns(data)
      }
      
      setError('')
    } catch (err) {
      setError('Failed to load spending patterns')
      console.error('Error fetching patterns:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <span className="text-red-600">↗️</span>
      case 'decreasing':
        return <span className="text-green-600">↘️</span>
      default:
        return <span className="text-gray-700">→</span>
    }
  }

  // Future use: const getTrendColor = (trend: 'increasing' | 'decreasing' | 'stable') => {
  //   switch (trend) {
  //     case 'increasing':
  //       return 'text-red-600'
  //     case 'decreasing':
  //       return 'text-green-600'
  //     default:
  //       return 'text-gray-700'
  //   }
  // }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">Spending Patterns</h3>
          
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

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('category')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'category'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            By Category
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'location'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            By Location
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-700">Loading spending patterns...</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-700">{error}</div>
        </div>
      )}

      {!loading && !error && activeTab === 'category' && categoryPatterns.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-700">No category data available for the selected timeframe</div>
        </div>
      )}

      {!loading && !error && activeTab === 'location' && locationPatterns.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-700">No location data available for the selected timeframe</div>
        </div>
      )}

      {/* Category Patterns */}
      {!loading && !error && activeTab === 'category' && categoryPatterns.length > 0 && (
        <div className="space-y-4">
          {categoryPatterns.slice(0, 10).map((pattern, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{pattern.category}</h4>
                  {getTrendIcon(pattern.trend)}
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  {pattern.transactionCount} transaction{pattern.transactionCount !== 1 ? 's' : ''} • 
                  Avg: ${pattern.averagePerTransaction.toFixed(2)}
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  ${pattern.amount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-700">
                  {pattern.percentage.toFixed(1)}% of total
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Location Patterns */}
      {!loading && !error && activeTab === 'location' && locationPatterns.length > 0 && (
        <div className="space-y-4">
          {locationPatterns.slice(0, 10).map((pattern, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{pattern.locationName}</h4>
                  <div className="text-sm text-gray-700">{pattern.businessName}</div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    ${pattern.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-700">
                    {pattern.percentage.toFixed(1)}% of total
                  </div>
                </div>
              </div>
              
              {pattern.topCategories.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-700 mb-2">Top Categories:</div>
                  <div className="flex flex-wrap gap-2">
                    {pattern.topCategories.slice(0, 3).map((cat, catIndex) => (
                      <span
                        key={catIndex}
                        className="px-2 py-1 bg-white rounded text-xs text-gray-900 border"
                      >
                        {cat.category} (${cat.amount.toFixed(0)})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}