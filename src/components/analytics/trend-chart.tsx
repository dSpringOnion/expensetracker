'use client'

import React, { useState, useEffect } from 'react'
import { TrendAnalysis, AnalyticsTimeframe } from '@/types'

interface TrendChartProps {
  className?: string
}

const TIMEFRAME_OPTIONS: AnalyticsTimeframe[] = [
  { label: 'Last 7 Days', value: 'last7days' },
  { label: 'Last 30 Days', value: 'last30days' },
  { label: 'Last 12 Months', value: 'last12months' }
]

export default function TrendChart({ className = '' }: TrendChartProps) {
  const [trends, setTrends] = useState<TrendAnalysis[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<AnalyticsTimeframe>(TIMEFRAME_OPTIONS[1])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTrends()
  }, [selectedTimeframe])

  const fetchTrends = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/trends?timeframe=${selectedTimeframe.value}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch trend data')
      }
      
      const data = await response.json()
      setTrends(data)
      setError('')
    } catch (err) {
      setError('Failed to load trend analysis')
      console.error('Error fetching trends:', err)
    } finally {
      setLoading(false)
    }
  }

  const maxAmount = Math.max(...trends.map(t => t.totalAmount), 0)

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">Spending Trends</h3>
        
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
          <div className="text-gray-700">Loading trend analysis...</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-700">{error}</div>
        </div>
      )}

      {!loading && !error && trends.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-700">No expense data available for the selected timeframe</div>
        </div>
      )}

      {!loading && !error && trends.length > 0 && (
        <div className="space-y-6">
          {/* Chart */}
          <div className="h-64 flex items-end space-x-2 border-b border-gray-200 pb-4">
            {trends.map((trend, index) => {
              const height = maxAmount > 0 ? (trend.totalAmount / maxAmount) * 200 : 0
              const isPositiveChange = trend.previousPeriod && trend.previousPeriod.percentageChange > 0
              const isNegativeChange = trend.previousPeriod && trend.previousPeriod.percentageChange < 0
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="flex flex-col items-center mb-2 min-h-[40px]">
                    <div className="text-xs font-medium text-gray-900 mb-1">
                      ${trend.totalAmount.toLocaleString()}
                    </div>
                    {trend.previousPeriod && (
                      <div className={`text-xs ${
                        isPositiveChange ? 'text-red-600' : 
                        isNegativeChange ? 'text-green-600' : 'text-gray-700'
                      }`}>
                        {isPositiveChange ? '↑' : isNegativeChange ? '↓' : '='} 
                        {Math.abs(trend.previousPeriod.percentageChange).toFixed(1)}%
                      </div>
                    )}
                  </div>
                  
                  <div
                    className="w-full bg-blue-500 rounded-t-md transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${height}px`, minHeight: trend.totalAmount > 0 ? '4px' : '0px' }}
                  />
                  
                  <div className="text-xs text-gray-700 mt-2 text-center leading-tight">
                    {trend.period}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                ${trends.reduce((sum, t) => sum + t.totalAmount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-700">Total Spending</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {trends.reduce((sum, t) => sum + t.transactionCount, 0)}
              </div>
              <div className="text-sm text-gray-700">Transactions</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                ${(trends.reduce((sum, t) => sum + t.averageAmount, 0) / Math.max(trends.length, 1)).toFixed(0)}
              </div>
              <div className="text-sm text-gray-700">Avg per Transaction</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {trends.length}
              </div>
              <div className="text-sm text-gray-700">Periods</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}