export interface Organization {
  id: string
  name: string
  taxId?: string
  address?: string
  settings?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface Business {
  id: string
  organizationId: string
  name: string
  businessType?: string
  taxSettings?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface Location {
  id: string
  businessId: string
  name: string
  address?: string
  managerEmail?: string
  settings?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  name?: string
  role: string
  organizationId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Expense {
  id: string
  title: string
  amount: number
  category: string
  categories: string[]
  description?: string
  date: Date
  receiptUrl?: string
  expenseCode?: string
  taxDeductible: boolean
  vendorName?: string
  approvalStatus: string
  userId: string
  businessId?: string
  locationId?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateExpenseData {
  title: string
  amount: number
  category: string
  categories?: string[]
  description?: string
  date: Date
  receiptUrl?: string
  expenseCode?: string
  taxDeductible?: boolean
  vendorName?: string
  businessId?: string
  locationId?: string
}

export interface ExpenseFilters {
  category?: string
  dateFrom?: Date
  dateTo?: Date
  minAmount?: number
  maxAmount?: number
  businessId?: string
  locationId?: string
  approvalStatus?: string
}

export interface ExpenseStats {
  totalExpenses: number
  totalAmount: number
  avgAmount: number
  categoryBreakdown: Record<string, number>
}

// Business-specific expense categories
export const RESTAURANT_CATEGORIES = [
  'Food & Beverage Inventory',
  'Kitchen Equipment & Supplies',
  'Staff Meals & Benefits',
  'Cleaning & Sanitation',
  'Utilities (Gas/Electric/Water)',
  'Equipment Maintenance',
  'Marketing & Promotion'
] as const

export const RETAIL_CATEGORIES = [
  'Inventory & Merchandise',
  'Store Fixtures & Equipment',
  'Point of Sale Systems',
  'Security & Surveillance',
  'Store Maintenance',
  'Customer Service'
] as const

export const PROFESSIONAL_CATEGORIES = [
  'Office Supplies & Equipment',
  'Professional Development',
  'Client Entertainment',
  'Technology & Software',
  'Insurance & Legal'
] as const

export const GENERAL_CATEGORIES = [
  'Office Supplies',
  'Professional Services',
  'Insurance',
  'Marketing/Advertising',
  'Vehicle/Transportation',
  'Technology/Software',
  'Utilities',
  'Rent & Facilities',
  'Other'
] as const

export const EXPENSE_CATEGORIES = [
  ...RESTAURANT_CATEGORIES,
  ...RETAIL_CATEGORIES,
  ...PROFESSIONAL_CATEGORIES,
  ...GENERAL_CATEGORIES
] as const

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]

export const BUSINESS_TYPES = [
  'Restaurant/Food Service',
  'Retail',
  'Professional Services',
  'General Business'
] as const

export type BusinessType = typeof BUSINESS_TYPES[number]

export const USER_ROLES = [
  'owner',
  'business_manager',
  'location_manager',
  'employee',
  'accountant'
] as const

export type UserRole = typeof USER_ROLES[number]

export const APPROVAL_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'auto_approved'
] as const

export type ApprovalStatus = typeof APPROVAL_STATUSES[number]

export interface Budget {
  id: string
  name: string
  amount: number
  period: BudgetPeriod
  startDate: Date
  endDate?: Date
  category?: string
  organizationId: string
  businessId?: string
  locationId?: string
  alertThreshold: number
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateBudgetData {
  name: string
  amount: number
  period: BudgetPeriod
  startDate: Date
  endDate?: Date
  category?: string
  businessId?: string
  locationId?: string
  alertThreshold?: number
}

export interface RecurringExpense {
  id: string
  title: string
  amount: number
  category: string
  categories: string[]
  description?: string
  frequency: RecurringFrequency
  startDate: Date
  endDate?: Date
  nextDueDate: Date
  dayOfMonth?: number
  dayOfWeek?: number
  expenseCode?: string
  taxDeductible: boolean
  vendorName?: string
  isActive: boolean
  autoCreate: boolean
  userId: string
  businessId?: string
  locationId?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateRecurringExpenseData {
  title: string
  amount: number
  category: string
  categories?: string[]
  description?: string
  frequency: RecurringFrequency
  startDate: Date
  endDate?: Date
  dayOfMonth?: number
  dayOfWeek?: number
  expenseCode?: string
  taxDeductible?: boolean
  vendorName?: string
  autoCreate?: boolean
  businessId?: string
  locationId?: string
}

export interface BudgetStats {
  budgetId: string
  budgetName: string
  budgetAmount: number
  spentAmount: number
  remainingAmount: number
  percentageUsed: number
  isOverBudget: boolean
  alertTriggered: boolean
  period: BudgetPeriod
  daysRemaining?: number
}

export const BUDGET_PERIODS = [
  'monthly',
  'quarterly',
  'yearly'
] as const

export type BudgetPeriod = typeof BUDGET_PERIODS[number]

export const RECURRING_FREQUENCIES = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly'
] as const

export type RecurringFrequency = typeof RECURRING_FREQUENCIES[number]

// Advanced Analytics Types
export interface TrendAnalysis {
  period: string
  totalExpenses: number
  totalAmount: number
  averageAmount: number
  transactionCount: number
  previousPeriod?: {
    totalAmount: number
    percentageChange: number
  }
}

export interface SpendingPattern {
  category: string
  amount: number
  percentage: number
  trend: 'increasing' | 'decreasing' | 'stable'
  averagePerTransaction: number
  transactionCount: number
}

export interface LocationSpendingPattern {
  locationId: string
  locationName: string
  businessName: string
  amount: number
  percentage: number
  topCategories: Array<{
    category: string
    amount: number
    percentage: number
  }>
}

export interface VendorAnalysis {
  vendorName: string
  totalAmount: number
  transactionCount: number
  averageAmount: number
  lastTransactionDate: Date
  topCategories: string[]
  trend: 'increasing' | 'decreasing' | 'stable'
}

export interface BudgetForecast {
  budgetId: string
  budgetName: string
  currentSpending: number
  projectedSpending: number
  projectedOverage: number
  daysRemaining: number
  dailyBurnRate: number
  recommendedDailySpending: number
}

export interface CustomReportFilters {
  dateRange: {
    start: Date
    end: Date
  }
  categories?: string[]
  businesses?: string[]
  locations?: string[]
  vendors?: string[]
  minAmount?: number
  maxAmount?: number
  taxDeductibleOnly?: boolean
  groupBy?: 'day' | 'week' | 'month' | 'category' | 'location' | 'vendor'
  sortBy?: 'date' | 'amount' | 'category'
  sortOrder?: 'asc' | 'desc'
}

export interface CustomReportData {
  summary: {
    totalAmount: number
    transactionCount: number
    averageAmount: number
    dateRange: {
      start: Date
      end: Date
    }
  }
  groupedData: Array<{
    label: string
    amount: number
    transactionCount: number
    percentage: number
  }>
  trendData: TrendAnalysis[]
  topCategories: SpendingPattern[]
  topVendors: VendorAnalysis[]
}

export interface DashboardWidget {
  id: string
  type: 'spending-summary' | 'budget-overview' | 'category-breakdown' | 'trend-chart' | 'vendor-analysis' | 'location-spending'
  title: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  config?: Record<string, unknown>
  isVisible: boolean
}

export interface AnalyticsTimeframe {
  label: string
  value: 'last7days' | 'last30days' | 'last90days' | 'last12months' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'custom'
  startDate?: Date
  endDate?: Date
}