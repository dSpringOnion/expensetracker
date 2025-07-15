'use client'

import React, { useState, useEffect } from 'react'
import { BudgetForecast } from '@/types'

interface BudgetForecastProps {
  className?: string
}

export default function BudgetForecastComponent({ className = '' }: BudgetForecastProps) {
  const [forecasts, setForecasts] = useState<BudgetForecast[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchForecasts()
  }, [])

  const fetchForecasts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics/forecast')
      
      if (!response.ok) {
        throw new Error('Failed to fetch forecast data')
      }
      
      const data = await response.json()
      setForecasts(data)
      setError('')
    } catch (err) {
      setError('Failed to load budget forecasts')
      console.error('Error fetching forecasts:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (currentSpending: number, projectedSpending: number, budgetAmount: number) => {
    if (projectedSpending > budgetAmount) return 'text-red-600'
    if (projectedSpending > budgetAmount * 0.8) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getStatusIcon = (currentSpending: number, projectedSpending: number, budgetAmount: number) => {
    if (projectedSpending > budgetAmount) return '⚠️'
    if (projectedSpending > budgetAmount * 0.8) return '⚡'
    return '✅'
  }

  const getStatusText = (currentSpending: number, projectedSpending: number, budgetAmount: number) => {
    if (projectedSpending > budgetAmount) return 'Over Budget'
    if (projectedSpending > budgetAmount * 0.8) return 'At Risk'
    return 'On Track'
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Budget Forecasts</h3>
        <button
          onClick={fetchForecasts}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-700">Loading budget forecasts...</div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-700">{error}</div>
        </div>
      )}

      {!loading && !error && forecasts.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-700">No active budgets to forecast</div>
          <div className="text-sm text-gray-700 mt-2">
            Create budgets to see spending projections and recommendations
          </div>
        </div>
      )}

      {!loading && !error && forecasts.length > 0 && (
        <div className="space-y-6">
          {forecasts.map((forecast, index) => {
            const currentPercentage = (forecast.currentSpending / forecast.projectedSpending) * 100
            const projectedPercentage = 100
            // const budgetExceeded = forecast.projectedSpending > forecast.currentSpending // Future use
            
            return (
              <div key={index} className="p-5 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{forecast.budgetName}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={getStatusColor(forecast.currentSpending, forecast.projectedSpending, forecast.currentSpending)}>
                        {getStatusIcon(forecast.currentSpending, forecast.projectedSpending, forecast.currentSpending)}
                      </span>
                      <span className={`text-sm font-medium ${getStatusColor(forecast.currentSpending, forecast.projectedSpending, forecast.currentSpending)}`}>
                        {getStatusText(forecast.currentSpending, forecast.projectedSpending, forecast.currentSpending)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ${forecast.currentSpending.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-700">
                      Current Spending
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-700 mb-2">
                    <span>Current vs Projected Spending</span>
                    <span>{forecast.daysRemaining} days remaining</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 relative">
                    {/* Current spending bar */}
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(currentPercentage, 100)}%` }}
                    />
                    
                    {/* Projected spending indicator */}
                    {forecast.projectedSpending > forecast.currentSpending && (
                      <div
                        className="absolute top-0 h-3 bg-red-300 rounded-r-full"
                        style={{ 
                          left: `${Math.min(currentPercentage, 100)}%`,
                          width: `${Math.min(100 - currentPercentage, projectedPercentage - currentPercentage)}%`
                        }}
                      />
                    )}
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-700 mt-1">
                    <span>${forecast.currentSpending.toLocaleString()}</span>
                    <span>${forecast.projectedSpending.toLocaleString()} projected</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      ${forecast.dailyBurnRate.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-700">Daily Burn Rate</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      ${forecast.recommendedDailySpending.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-700">Recommended Daily</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      ${forecast.projectedOverage.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-700">Projected Overage</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {forecast.daysRemaining}
                    </div>
                    <div className="text-xs text-gray-700">Days Left</div>
                  </div>
                </div>

                {/* Recommendations */}
                {forecast.projectedOverage > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="flex items-start space-x-2">
                      <span className="text-red-600 mt-0.5">⚠️</span>
                      <div>
                        <div className="text-sm font-medium text-red-800">Budget Alert</div>
                        <div className="text-sm text-red-700 mt-1">
                          At current spending rate, you&apos;ll exceed budget by ${forecast.projectedOverage.toFixed(0)}. 
                          Consider reducing daily spending to ${forecast.recommendedDailySpending.toFixed(0)} to stay on track.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {forecast.projectedOverage === 0 && forecast.dailyBurnRate < forecast.recommendedDailySpending && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600 mt-0.5">✅</span>
                      <div>
                        <div className="text-sm font-medium text-green-800">On Track</div>
                        <div className="text-sm text-green-700 mt-1">
                          Your spending is on track to stay within budget. 
                          You have ${(forecast.recommendedDailySpending * forecast.daysRemaining - forecast.projectedOverage).toFixed(0)} 
                          remaining budget flexibility.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}