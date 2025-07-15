'use client'

import { useState, useEffect } from 'react'
import { Budget, BudgetStats } from '@/types'

interface BudgetOverviewProps {
  businessId?: string
  locationId?: string
}

export default function BudgetOverview({ businessId, locationId }: BudgetOverviewProps) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [stats, setStats] = useState<BudgetStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ stats: 'true' })
      if (businessId) params.append('businessId', businessId)
      if (locationId) params.append('locationId', locationId)

      const response = await fetch(`/api/budgets?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch budgets')
      }

      const data = await response.json()
      setBudgets(data.budgets || [])
      setStats(data.stats || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch budgets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBudgets()
  }, [businessId, locationId])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-6 w-48 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error: {error}</p>
        <button 
          onClick={fetchBudgets}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (budgets.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets yet</h3>
        <p className="text-gray-900 mb-4">Create your first budget to start tracking your spending</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Budget Overview</h2>
        <button 
          onClick={fetchBudgets}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const budget = budgets.find(b => b.id === stat.budgetId)
          if (!budget) return null

          return (
            <div key={stat.budgetId} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">{stat.budgetName}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  stat.isOverBudget 
                    ? 'bg-red-100 text-red-800'
                    : stat.alertTriggered
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {stat.isOverBudget ? 'Over Budget' : stat.alertTriggered ? 'Warning' : 'On Track'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-900">Budget</span>
                  <span className="font-medium">${stat.budgetAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-900">Spent</span>
                  <span className={`font-medium ${stat.isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                    ${stat.spentAmount.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-900">Remaining</span>
                  <span className={`font-medium ${stat.remainingAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${stat.remainingAmount.toFixed(2)}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      stat.isOverBudget 
                        ? 'bg-red-500'
                        : stat.alertTriggered
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(stat.percentageUsed, 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-700">
                  <span>{stat.percentageUsed.toFixed(1)}% used</span>
                  {stat.daysRemaining && (
                    <span>{stat.daysRemaining} days left</span>
                  )}
                </div>

                {budget.category && (
                  <div className="text-xs text-gray-700 mt-2">
                    Category: {budget.category}
                  </div>
                )}

                <div className="text-xs text-gray-700">
                  Period: {budget.period}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}