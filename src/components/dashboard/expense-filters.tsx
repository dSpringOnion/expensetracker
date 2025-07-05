'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { EXPENSE_CATEGORIES, type ExpenseFilters } from '@/types'
import { Filter, X } from 'lucide-react'

interface ExpenseFiltersProps {
  onFilterChange: (filters: ExpenseFilters) => void
  className?: string
}

export function ExpenseFilters({ onFilterChange, className }: ExpenseFiltersProps) {
  const [filters, setFilters] = useState({
    category: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  })

  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Convert empty strings to undefined and numbers to actual numbers
    const cleanFilters: ExpenseFilters = {}
    
    if (newFilters.category && newFilters.category !== '') {
      cleanFilters.category = newFilters.category
    }
    
    if (newFilters.dateFrom && newFilters.dateFrom !== '') {
      cleanFilters.dateFrom = new Date(newFilters.dateFrom)
    }
    
    if (newFilters.dateTo && newFilters.dateTo !== '') {
      cleanFilters.dateTo = new Date(newFilters.dateTo)
    }
    
    if (newFilters.minAmount && newFilters.minAmount !== '') {
      cleanFilters.minAmount = parseFloat(newFilters.minAmount)
    }
    
    if (newFilters.maxAmount && newFilters.maxAmount !== '') {
      cleanFilters.maxAmount = parseFloat(newFilters.maxAmount)
    }
    
    onFilterChange(cleanFilters)
  }

  const clearFilters = () => {
    const emptyFilters = {
      category: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: ''
    }
    setFilters(emptyFilters)
    onFilterChange({})
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {Object.values(filters).filter(v => v !== '').length}
            </span>
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg border p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="category-filter">Category</Label>
              <Select
                id="category-filter"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="date-from">Date From</Label>
              <Input
                id="date-from"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="date-to">Date To</Label>
              <Input
                id="date-to"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="min-amount">Min Amount</Label>
              <Input
                id="min-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="max-amount">Max Amount</Label>
              <Input
                id="max-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}