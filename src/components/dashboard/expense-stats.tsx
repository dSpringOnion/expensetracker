'use client'

import { useMemo } from 'react'
import { Expense } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, TrendingUp, Calendar, PieChart } from 'lucide-react'

interface ExpenseStatsProps {
  expenses: Expense[]
  className?: string
}

export function ExpenseStats({ expenses, className }: ExpenseStatsProps) {
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const average = expenses.length > 0 ? total / expenses.length : 0
    
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)
    
    const topCategory = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)[0]
    
    const thisMonth = new Date()
    const thisMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getMonth() === thisMonth.getMonth() &&
             expenseDate.getFullYear() === thisMonth.getFullYear()
    })
    
    const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    
    return {
      total,
      average,
      count: expenses.length,
      thisMonthTotal,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      categoryTotals
    }
  }, [expenses])

  const statCards = [
    {
      title: 'Total Expenses',
      value: formatCurrency(stats.total),
      icon: DollarSign,
      color: 'text-blue-600'
    },
    {
      title: 'This Month',
      value: formatCurrency(stats.thisMonthTotal),
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'Average',
      value: formatCurrency(stats.average),
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Top Category',
      value: stats.topCategory ? `${stats.topCategory.name}: ${formatCurrency(stats.topCategory.amount)}` : 'N/A',
      icon: PieChart,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(stats.categoryTotals).length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(stats.categoryTotals)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => {
                const percentage = (amount / stats.total) * 100
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span className="text-sm font-medium">{category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatCurrency(amount)}</div>
                      <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
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