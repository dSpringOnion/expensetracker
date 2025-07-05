'use client'

import { Expense } from '@/types'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Trash2, Receipt } from 'lucide-react'

interface ExpenseListProps {
  expenses: Expense[]
  onDelete?: (id: string) => void
  className?: string
}

export function ExpenseList({ expenses, onDelete, className }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No expenses found</p>
        <p className="text-sm">Start by adding your first expense!</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{expense.title}</h3>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded-full">
                    {expense.category}
                  </span>
                  <span>{formatDate(new Date(expense.date))}</span>
                </div>
                {expense.description && (
                  <p className="text-sm text-gray-700 mt-2">{expense.description}</p>
                )}
                {expense.receiptUrl && (
                  <div className="mt-2">
                    <a
                      href={expense.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center gap-1"
                    >
                      <Receipt className="h-4 w-4" />
                      View Receipt
                    </a>
                  </div>
                )}
              </div>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(expense.id)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}