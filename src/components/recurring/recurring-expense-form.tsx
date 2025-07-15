'use client'

import { useState, useEffect } from 'react'
import { CreateRecurringExpenseData, RECURRING_FREQUENCIES, EXPENSE_CATEGORIES, Business, Location } from '@/types'

interface RecurringExpenseFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function RecurringExpenseForm({ onSuccess, onCancel }: RecurringExpenseFormProps) {
  const [formData, setFormData] = useState<CreateRecurringExpenseData>({
    title: '',
    amount: 0,
    category: '',
    frequency: 'monthly',
    startDate: new Date(),
    taxDeductible: true,
    autoCreate: false
  })
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBusinesses()
  }, [])

  useEffect(() => {
    if (formData.businessId) {
      fetchLocations(formData.businessId)
    } else {
      setLocations([])
      setFormData(prev => ({ ...prev, locationId: undefined }))
    }
  }, [formData.businessId])

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/businesses')
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data)
      }
    } catch (err) {
      console.error('Failed to fetch businesses:', err)
    }
  }

  const fetchLocations = async (businessId: string) => {
    try {
      const response = await fetch(`/api/locations?businessId=${businessId}`)
      if (response.ok) {
        const data = await response.json()
        setLocations(data)
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/recurring-expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          categories: [formData.category]
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create recurring expense')
      }

      setFormData({
        title: '',
        amount: 0,
        category: '',
        frequency: 'monthly',
        startDate: new Date(),
        taxDeductible: true,
        autoCreate: false
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recurring expense')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof CreateRecurringExpenseData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getDayOptions = () => {
    const days = []
    for (let i = 1; i <= 31; i++) {
      days.push(i)
    }
    return days
  }

  const getWeekDayOptions = () => {
    return [
      { value: 0, label: 'Sunday' },
      { value: 1, label: 'Monday' },
      { value: 2, label: 'Tuesday' },
      { value: 3, label: 'Wednesday' },
      { value: 4, label: 'Thursday' },
      { value: 5, label: 'Friday' },
      { value: 6, label: 'Saturday' }
    ]
  }

  const needsDayOfMonth = ['monthly', 'quarterly', 'yearly'].includes(formData.frequency)
  const needsDayOfWeek = formData.frequency === 'weekly'

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Create Recurring Expense</h3>
        {onCancel && (
          <button 
            type="button"
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-900"
          >
            ×
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Monthly Office Rent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Amount *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-700">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select category</option>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Frequency *
          </label>
          <select
            value={formData.frequency}
            onChange={(e) => handleChange('frequency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {RECURRING_FREQUENCIES.map((frequency) => (
              <option key={frequency} value={frequency}>
                {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            value={formData.startDate.toISOString().split('T')[0]}
            onChange={(e) => handleChange('startDate', new Date(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {needsDayOfMonth && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Day of Month
            </label>
            <select
              value={formData.dayOfMonth || ''}
              onChange={(e) => handleChange('dayOfMonth', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Use start date</option>
              {getDayOptions().map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        )}

        {needsDayOfWeek && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Day of Week
            </label>
            <select
              value={formData.dayOfWeek ?? ''}
              onChange={(e) => handleChange('dayOfWeek', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Use start date</option>
              {getWeekDayOptions().map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            End Date (Optional)
          </label>
          <input
            type="date"
            value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => handleChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Vendor (Optional)
          </label>
          <input
            type="text"
            value={formData.vendorName || ''}
            onChange={(e) => handleChange('vendorName', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Landlord, Utility Company"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Business (Optional)
          </label>
          <select
            value={formData.businessId || ''}
            onChange={(e) => handleChange('businessId', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select business</option>
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Location (Optional)
          </label>
          <select
            value={formData.locationId || ''}
            onChange={(e) => handleChange('locationId', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!formData.businessId}
          >
            <option value="">Select location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Description (Optional)
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value || undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Additional details about this recurring expense"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="taxDeductible"
            checked={formData.taxDeductible}
            onChange={(e) => handleChange('taxDeductible', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="taxDeductible" className="ml-2 text-sm text-gray-900">
            Tax deductible
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoCreate"
            checked={formData.autoCreate}
            onChange={(e) => handleChange('autoCreate', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="autoCreate" className="ml-2 text-sm text-gray-900">
            Auto-create expenses (requires manual approval)
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Recurring Expense'}
        </button>
      </div>
    </form>
  )
}