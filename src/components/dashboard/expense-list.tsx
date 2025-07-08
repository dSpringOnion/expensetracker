'use client'

import { Expense } from '@/types'
import { Button } from '@/components/ui/button'
import { ReceiptViewer } from '@/components/ui/receipt-viewer'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Trash2, Receipt, Building, MapPin, CheckCircle, Clock, XCircle } from 'lucide-react'

interface ExpenseListProps {
  expenses: Expense[]
  onDelete?: (id: string) => void
  className?: string
}

export function ExpenseList({ expenses, onDelete, className }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <Receipt className="h-16 w-16 mx-auto mb-4 text-slack-light" />
        <p className="text-lg font-medium mb-2 text-slack-primary">No expenses found</p>
        <p className="text-slack-light">Start by adding your first expense!</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:bg-gray-50/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{expense.title}</h3>
                  <span className="text-xl font-bold text-emerald-600">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                  {/* Display multiple categories if available, otherwise single category */}
                  {expense.categories && expense.categories.length > 0 ? (
                    expense.categories.map((cat, index) => (
                      <span key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 px-3 py-1.5 rounded-full font-semibold border border-gray-200 shadow-sm">
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 px-3 py-1.5 rounded-full font-semibold border border-gray-200 shadow-sm">
                      {expense.category}
                    </span>
                  )}
                  <span className="text-gray-600 font-medium">{formatDate(new Date(expense.date))}</span>
                  
                  {/* Approval Status */}
                  <div className="flex items-center gap-1">
                    {expense.approvalStatus === 'approved' && (
                      <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
                        <CheckCircle className="h-3 w-3" />
                        Approved
                      </span>
                    )}
                    {expense.approvalStatus === 'pending' && (
                      <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-medium">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                    {expense.approvalStatus === 'rejected' && (
                      <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium">
                        <XCircle className="h-3 w-3" />
                        Rejected
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Business and Location Info */}
                {(expense.businessId || expense.locationId) && (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-2">
                    {expense.businessId && (
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        Business ID: {expense.businessId}
                      </span>
                    )}
                    {expense.locationId && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Location ID: {expense.locationId}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Additional Details */}
                {(expense.vendorName || expense.expenseCode) && (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-2">
                    {expense.vendorName && (
                      <span><strong>Vendor:</strong> {expense.vendorName}</span>
                    )}
                    {expense.expenseCode && (
                      <span><strong>Code:</strong> {expense.expenseCode}</span>
                    )}
                    {!expense.taxDeductible && (
                      <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded-full font-medium">
                        Non-deductible
                      </span>
                    )}
                  </div>
                )}
                {expense.description && (
                  <p className="text-sm text-gray-600 mt-2">{expense.description}</p>
                )}
              </div>
              
              {/* Receipt Thumbnail and Actions */}
              <div className="flex items-center gap-2">
                {expense.receiptUrl && (
                  <ReceiptViewer
                    receiptUrl={expense.receiptUrl}
                    expenseTitle={expense.title}
                  />
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