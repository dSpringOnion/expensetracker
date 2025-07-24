'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ExpenseForm } from '@/components/forms/expense-form'
import { ExpenseList } from '@/components/dashboard/expense-list'
import { ExpenseStats } from '@/components/dashboard/expense-stats'
import { ExpenseFilters as ExpenseFiltersComponent } from '@/components/dashboard/expense-filters'
import { ImportExportSection } from '@/components/import-export/import-export-section'
import { UserManagement } from '@/components/admin/user-management'
import { Expense, ExpenseFilters } from '@/types'
import { Plus, BarChart3, LogOut, User, FileSpreadsheet, Settings, DollarSign, Repeat, TrendingUp } from 'lucide-react'
import BudgetOverview from '@/components/budget/budget-overview'
import BudgetForm from '@/components/budget/budget-form'
import RecurringExpensesList from '@/components/recurring/recurring-expenses-list'
import RecurringExpenseForm from '@/components/recurring/recurring-expense-form'
import AnalyticsDashboard from '@/components/analytics/analytics-dashboard'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([])
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'budgets' | 'recurring' | 'analytics' | 'import-export' | 'admin'>('add')
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [showRecurringForm, setShowRecurringForm] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    fetchExpenses()
    fetchUserRole()
  }, [])

  const fetchUserRole = async (): Promise<void> => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data: { role: string } = await response.json()
        setUserRole(data.role)
      }
    } catch (error) {
      console.error('Failed to fetch user role:', error)
    }
  }

  useEffect(() => {
    setFilteredExpenses(expenses)
  }, [expenses])

  const fetchExpenses = async (): Promise<void> => {
    try {
      const response = await fetch('/api/expenses')
      if (response.ok) {
        const data: Expense[] = await response.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  interface AddExpenseData {
    title: string
    amount: number
    category: string
    description?: string
    date: string
    businessId?: string
    locationId?: string
    vendorName?: string
    expenseCode?: string
    taxDeductible?: boolean
    receiptFile?: File
  }

  const handleAddExpense = async (data: AddExpenseData): Promise<void> => {
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
      const newExpense: Expense = await response.json()
      setExpenses(prev => [newExpense, ...prev])
      setActiveTab('list')
    } else {
      // Get error details from response
      let errorMessage = 'Failed to add expense'
      try {
        const errorData: { error?: string; details?: Array<{ path?: string[]; message: string }> } = await response.json()
        if (errorData.error) {
          errorMessage = errorData.error
        }
        if (errorData.details && Array.isArray(errorData.details)) {
          // Handle validation errors
          const validationErrors = errorData.details.map((err) => `${err.path?.join('.')}: ${err.message}`).join(', ')
          errorMessage = `Validation errors: ${validationErrors}`
        }
      } catch {
        // If we can't parse the error response, use the status
        errorMessage = `Failed to add expense (${response.status})`
      }
      throw new Error(errorMessage)
    }
  }


  const handleFilterChange = (filters: ExpenseFilters): void => {
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

  // Define tabs based on user role
  const baseTabs = [
    { id: 'add', label: 'Add Expense', icon: Plus },
    { id: 'list', label: 'View Expenses', icon: BarChart3 },
    { id: 'budgets', label: 'Budgets', icon: DollarSign },
    { id: 'recurring', label: 'Recurring', icon: Repeat },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ]

  const managerTabs = [
    ...baseTabs,
    { id: 'import-export', label: 'Import/Export', icon: FileSpreadsheet },
  ]

  const adminTabs = [
    ...managerTabs,
    { id: 'admin', label: 'Admin', icon: Settings },
  ]

  // Determine which tabs to show based on user role
  const tabs = userRole === 'ORGANIZATION_ADMIN' || userRole === 'SUPER_ADMIN' 
    ? adminTabs
    : userRole === 'MANAGER' || userRole === 'BUSINESS_OWNER'
    ? managerTabs 
    : baseTabs

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expenses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* User Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-gray-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Welcome, {session?.user?.name || 'User'}</h3>
                <p className="text-sm text-gray-600">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>

          <header className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-6 shadow-lg">
              <img src="/SJ.png" alt="SJ Logo" className="w-12 h-12" />
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
              <nav className="flex overflow-x-auto scrollbar-hide px-3 sm:px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'add' | 'list' | 'budgets' | 'recurring' | 'analytics' | 'import-export' | 'admin')}
                    className={`py-4 px-3 sm:px-6 border-b-2 font-semibold text-xs sm:text-sm flex items-center gap-1 sm:gap-2 transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-4 sm:p-8">
              {activeTab === 'add' && (
                <div className="max-w-md mx-auto">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Add New Expense</h2>
                  <ExpenseForm onSubmit={handleAddExpense} />
                </div>
              )}


              {activeTab === 'list' && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Your Expenses</h2>
                  
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

              {activeTab === 'budgets' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Budget Management</h2>
                    <button
                      onClick={() => setShowBudgetForm(!showBudgetForm)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center sm:justify-start"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-sm sm:text-base">{showBudgetForm ? 'Cancel' : 'Create Budget'}</span>
                    </button>
                  </div>

                  {showBudgetForm && (
                    <div className="mb-8">
                      <BudgetForm 
                        onSuccess={() => {
                          setShowBudgetForm(false)
                          // Refresh budget overview
                        }}
                        onCancel={() => setShowBudgetForm(false)}
                      />
                    </div>
                  )}

                  <BudgetOverview />
                </div>
              )}

              {activeTab === 'recurring' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Recurring Expenses</h2>
                    <button
                      onClick={() => setShowRecurringForm(!showRecurringForm)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center sm:justify-start"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-sm sm:text-base">{showRecurringForm ? 'Cancel' : 'Add Recurring'}</span>
                    </button>
                  </div>

                  {showRecurringForm && (
                    <div className="mb-8">
                      <RecurringExpenseForm 
                        onSuccess={() => {
                          setShowRecurringForm(false)
                          // Refresh recurring expenses list
                        }}
                        onCancel={() => setShowRecurringForm(false)}
                      />
                    </div>
                  )}

                  <RecurringExpensesList />
                </div>
              )}

              {activeTab === 'analytics' && (
                <div>
                  <AnalyticsDashboard />
                </div>
              )}

              {activeTab === 'import-export' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Import & Export</h2>
                  <ImportExportSection />
                </div>
              )}

              {activeTab === 'admin' && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Organization Administration</h2>
                  <UserManagement />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}