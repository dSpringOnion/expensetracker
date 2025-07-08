'use client'

import { useState, useEffect } from 'react'
import { ExpenseForm } from '@/components/forms/expense-form'
import { ExpenseList } from '@/components/dashboard/expense-list'
import { ExpenseStats } from '@/components/dashboard/expense-stats'
import { ExpenseFilters as ExpenseFiltersComponent } from '@/components/dashboard/expense-filters'
import { Expense, ExpenseFilters } from '@/types'
import { Plus, BarChart3 } from 'lucide-react'

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchExpenses()
  }, [])

  useEffect(() => {
    setFilteredExpenses(expenses)
  }, [expenses])

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses')
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddExpense = async (data: { title: string; amount: number; category: string; description?: string; date: string; businessId?: string; locationId?: string; vendorName?: string; expenseCode?: string; taxDeductible?: boolean; receiptFile?: File }) => {
    try {
      const formData = new FormData()
      
      // Add expense data as JSON
      const { receiptFile, ...expenseData } = data
      formData.append('data', JSON.stringify(expenseData))
      
      // Add receipt file if present
      if (receiptFile) {
        formData.append('receiptFile', receiptFile)
      }

      const response = await fetch('/api/expenses', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const newExpense = await response.json()
        setExpenses(prev => [newExpense, ...prev])
        setActiveTab('list')
      } else {
        throw new Error('Failed to add expense')
      }
    } catch (error) {
      console.error('Failed to add expense:', error)
      alert('Failed to add expense. Please try again.')
    }
  }


  const handleFilterChange = (filters: ExpenseFilters) => {
    let filtered = [...expenses]

    if (filters.category) {
      filtered = filtered.filter(expense => expense.category === filters.category)
    }

    if (filters.dateFrom) {
      const dateFrom = filters.dateFrom
      filtered = filtered.filter(expense => new Date(expense.date) >= dateFrom)
    }

    if (filters.dateTo) {
      const dateTo = filters.dateTo
      filtered = filtered.filter(expense => new Date(expense.date) <= dateTo)
    }

    if (filters.minAmount !== undefined) {
      const minAmount = filters.minAmount
      filtered = filtered.filter(expense => expense.amount >= minAmount)
    }

    if (filters.maxAmount !== undefined) {
      const maxAmount = filters.maxAmount
      filtered = filtered.filter(expense => expense.amount <= maxAmount)
    }

    setFilteredExpenses(filtered)
  }

  const tabs = [
    { id: 'add', label: 'Add Expense', icon: Plus },
    { id: 'list', label: 'View Expenses', icon: BarChart3 },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slack-panel">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007a5a] mx-auto mb-4"></div>
          <p className="text-slack-secondary">Loading expenses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
              Expense Tracker
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Streamline your business expense management with intelligent categorization and multi-location support
            </p>
          </header>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-6 overflow-hidden backdrop-blur-sm">
            <div className="border-b border-gray-100 bg-gray-50/50">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'add' | 'list')}
                    className={`py-4 px-6 border-b-2 font-semibold text-sm flex items-center gap-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-8">
              {activeTab === 'add' && (
                <div className="max-w-md mx-auto">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Add New Expense</h2>
                  <ExpenseForm onSubmit={handleAddExpense} />
                </div>
              )}


              {activeTab === 'list' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Expenses</h2>
                  
                  <ExpenseStats expenses={filteredExpenses} className="mb-6" />
                  
                  <ExpenseFiltersComponent
                    onFilterChange={handleFilterChange}
                    className="mb-6"
                  />
                  
                  <ExpenseList
                    expenses={filteredExpenses}
                    onDelete={async (id) => {
                      // Implement delete functionality
                      setExpenses(prev => prev.filter(expense => expense.id !== id))
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}