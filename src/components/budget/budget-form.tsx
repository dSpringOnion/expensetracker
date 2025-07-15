'use client'

import { useState, useEffect } from 'react'
import { CreateBudgetData, BUDGET_PERIODS, EXPENSE_CATEGORIES, Business, Location } from '@/types'

interface BudgetFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function BudgetForm({ onSuccess, onCancel }: BudgetFormProps) {
  const [formData, setFormData] = useState<CreateBudgetData>({
    name: '',
    amount: 0,
    period: 'monthly',
    startDate: new Date(),
    category: '',
    alertThreshold: 0.8
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
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create budget')
      }

      setFormData({
        name: '',
        amount: 0,
        period: 'monthly',
        startDate: new Date(),
        category: '',
        alertThreshold: 0.8
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create budget')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof CreateBudgetData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Create Budget</h3>
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
            Budget Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Monthly Marketing Budget"
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
            Period *
          </label>
          <select
            value={formData.period}
            onChange={(e) => handleChange('period', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {BUDGET_PERIODS.map((period) => (
              <option key={period} value={period}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
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

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Category (Optional)
          </label>
          <select
            value={formData.category || ''}
            onChange={(e) => handleChange('category', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Alert Threshold
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={formData.alertThreshold}
              onChange={(e) => handleChange('alertThreshold', parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-900 w-12">
              {Math.round((formData.alertThreshold || 0.8) * 100)}%
            </span>
          </div>
          <p className="text-xs text-gray-700 mt-1">
            Get alerts when budget reaches this percentage
          </p>
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
            <option value="">All Businesses</option>
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
            <option value="">All Locations</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
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
          {loading ? 'Creating...' : 'Create Budget'}
        </button>
      </div>
    </form>
  )
}