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