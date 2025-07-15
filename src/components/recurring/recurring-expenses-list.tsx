'use client'

import { useState, useEffect } from 'react'
import { RecurringExpense } from '@/types'

interface RecurringExpensesListProps {
  businessId?: string
  locationId?: string
  onEdit?: (expense: RecurringExpense) => void
}

export default function RecurringExpensesList({ businessId, locationId, onEdit }: RecurringExpensesListProps) {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)

  const fetchRecurringExpenses = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (businessId) params.append('businessId', businessId)
      if (locationId) params.append('locationId', locationId)

      const response = await fetch(`/api/recurring-expenses?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch recurring expenses')
      }

      const data = await response.json()
      setRecurringExpenses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recurring expenses')
    } finally {
      setLoading(false)
    }
  }

  const generateExpense = async (id: string) => {
    try {
      setGeneratingId(id)
      const response = await fetch(`/api/recurring-expenses/${id}/generate`, {
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate expense')
      }

      const data = await response.json()
      alert(`Expense generated successfully! Next due: ${new Date(data.nextDueDate).toLocaleDateString()}`)
      
      // Refresh the list
      fetchRecurringExpenses()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate expense')
    } finally {
      setGeneratingId(null)
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/recurring-expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (!response.ok) {
        throw new Error('Failed to update recurring expense')
      }

      fetchRecurringExpenses()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update recurring expense')
    }
  }

  useEffect(() => {
    fetchRecurringExpenses()
  }, [businessId, locationId])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-6 w-48 rounded"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error: {error}</p>
        <button 
          onClick={fetchRecurringExpenses}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (recurringExpenses.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No recurring expenses yet</h3>
        <p className="text-gray-900 mb-4">Set up recurring expenses to automate your expense tracking</p>
      </div>
    )
  }

  const formatFrequency = (frequency: string) => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1)
  }

  const isOverdue = (nextDueDate: Date) => {
    return new Date(nextDueDate) < new Date()
  }

  const isDueSoon = (nextDueDate: Date) => {
    const dueDate = new Date(nextDueDate)
    const today = new Date()
    const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000))
    return dueDate <= threeDaysFromNow && dueDate >= today
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Recurring Expenses</h2>
        <button 
          onClick={fetchRecurringExpenses}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {recurringExpenses.map((expense) => {
          const nextDue = new Date(expense.nextDueDate)
          const overdue = isOverdue(nextDue)
          const dueSoon = isDueSoon(nextDue)

          return (
            <div 
              key={expense.id} 
              className={`bg-white rounded-lg border p-6 ${
                overdue ? 'border-red-200 bg-red-50' : 
                dueSoon ? 'border-yellow-200 bg-yellow-50' : 
                'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900">{expense.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      !expense.isActive 
                        ? 'bg-gray-100 text-gray-800'
                        : overdue
                        ? 'bg-red-100 text-red-800'
                        : dueSoon
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {!expense.isActive ? 'Inactive' : overdue ? 'Overdue' : dueSoon ? 'Due Soon' : 'Active'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-900">Amount:</span>
                      <div className="font-medium">${expense.amount.toFixed(2)}</div>
                    </div>
                    
                    <div>
                      <span className="text-gray-900">Frequency:</span>
                      <div className="font-medium">{formatFrequency(expense.frequency)}</div>
                    </div>
                    
                    <div>
                      <span className="text-gray-900">Next Due:</span>
                      <div className={`font-medium ${overdue ? 'text-red-600' : dueSoon ? 'text-yellow-600' : ''}`}>
                        {nextDue.toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-900">Category:</span>
                      <div className="font-medium">{expense.category}</div>
                    </div>
                  </div>

                  {expense.description && (
                    <div className="mt-3 text-sm text-gray-900">
                      {expense.description}
                    </div>
                  )}

                  {expense.vendorName && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-900">Vendor:</span>
                      <span className="ml-1 font-medium">{expense.vendorName}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  {expense.isActive && (overdue || dueSoon) && (
                    <button
                      onClick={() => generateExpense(expense.id)}
                      disabled={generatingId === expense.id}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {generatingId === expense.id ? 'Generating...' : 'Generate Now'}
                    </button>
                  )}

                  <button
                    onClick={() => toggleActive(expense.id, expense.isActive)}
                    className={`px-3 py-1 text-sm rounded ${
                      expense.isActive 
                        ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {expense.isActive ? 'Deactivate' : 'Activate'}
                  </button>

                  {onEdit && (
                    <button
                      onClick={() => onEdit(expense)}
                      className="px-3 py-1 bg-gray-100 text-gray-900 text-sm rounded hover:bg-gray-200"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {expense.autoCreate && (
                <div className="mt-3 text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 inline-block">
                  Auto-creation enabled
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}