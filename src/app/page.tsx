'use client'

import { useState, useEffect } from 'react'
import { ExpenseForm } from '@/components/forms/expense-form'
import { PhotoUpload } from '@/components/forms/photo-upload'
import { ExpenseList } from '@/components/dashboard/expense-list'
import { ExpenseStats } from '@/components/dashboard/expense-stats'
import { ExpenseFilters as ExpenseFiltersComponent } from '@/components/dashboard/expense-filters'
import { Expense, ExpenseFilters } from '@/types'
import { Plus, Receipt, BarChart3 } from 'lucide-react'

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [activeTab, setActiveTab] = useState<'add' | 'photo' | 'list'>('add')
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

  const handleAddExpense = async (data: { title: string; amount: number; category: string; description?: string; date: string }) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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

  const handlePhotoUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload photo')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to upload photo:', error)
      throw error
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
    { id: 'photo', label: 'Photo Upload', icon: Receipt },
    { id: 'list', label: 'View Expenses', icon: BarChart3 },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Expense Tracker</h1>
            <p className="text-lg text-slate-700">Track your expenses with manual entries and photo uploads</p>
          </header>

          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'add' | 'photo' | 'list')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'add' && (
                <div className="max-w-md mx-auto">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-6">Add New Expense</h2>
                  <ExpenseForm onSubmit={handleAddExpense} />
                </div>
              )}

              {activeTab === 'photo' && (
                <div className="max-w-md mx-auto">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-6">Upload Receipt Photo</h2>
                  <PhotoUpload
                    onUpload={handlePhotoUpload}
                    onExtractedData={() => {
                      // Pre-fill form with extracted data
                      setActiveTab('add')
                      // You could implement form pre-filling here
                    }}
                  />
                </div>
              )}

              {activeTab === 'list' && (
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 mb-6">Your Expenses</h2>
                  
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