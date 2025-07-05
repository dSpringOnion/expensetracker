export interface Expense {
  id: string
  title: string
  amount: number
  category: string
  description?: string
  date: Date
  receiptUrl?: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateExpenseData {
  title: string
  amount: number
  category: string
  description?: string
  date: Date
  receiptUrl?: string
}

export interface ExpenseFilters {
  category?: string
  dateFrom?: Date
  dateTo?: Date
  minAmount?: number
  maxAmount?: number
}

export interface ExpenseStats {
  totalExpenses: number
  totalAmount: number
  avgAmount: number
  categoryBreakdown: Record<string, number>
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Other'
] as const

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]