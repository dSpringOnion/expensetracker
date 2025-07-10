'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TagSelector } from '@/components/ui/tag-selector'
import { MultiTagSelector } from '@/components/ui/multi-tag-selector'
import { SimpleBusinessForm } from '@/components/forms/simple-business-form'
import { SimpleLocationForm } from '@/components/forms/simple-location-form'
import { EXPENSE_CATEGORIES, Business, Location } from '@/types'
import { cn } from '@/lib/utils'

const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  categories: z.array(z.string()).optional(),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  businessId: z.string().optional(),
  locationId: z.string().optional(),
  vendorName: z.string().optional(),
  expenseCode: z.string().optional(),
  taxDeductible: z.boolean().optional(),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData & { receiptFile?: File }) => Promise<void>
  initialData?: Partial<ExpenseFormData>
  className?: string
}

export function ExpenseForm({ onSubmit, initialData, className }: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<{id: string, label: string} | undefined>()
  const [selectedLocation, setSelectedLocation] = useState<{id: string, label: string} | undefined>()
  const [selectedCategories, setSelectedCategories] = useState<{id: string, label: string}[]>([])
  const [showAddBusiness, setShowAddBusiness] = useState(false)
  const [showAddLocation, setShowAddLocation] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: initialData?.title || '',
      amount: initialData?.amount || 0,
      category: initialData?.category || '',
      categories: initialData?.categories || [],
      description: initialData?.description || '',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      businessId: initialData?.businessId || '',
      locationId: initialData?.locationId || '',
      vendorName: initialData?.vendorName || '',
      expenseCode: initialData?.expenseCode || '',
      taxDeductible: initialData?.taxDeductible ?? true,
    },
  })

  useEffect(() => {
    fetchBusinesses()
  }, [])

  useEffect(() => {
    if (selectedBusiness) {
      fetchLocations(selectedBusiness.id)
      setValue('businessId', selectedBusiness.id)
    } else {
      setLocations([])
      setSelectedLocation(undefined)
      setValue('businessId', '')
      setValue('locationId', '')
    }
  }, [selectedBusiness, setValue])

  useEffect(() => {
    if (selectedLocation) {
      setValue('locationId', selectedLocation.id)
    } else {
      setValue('locationId', '')
    }
  }, [selectedLocation, setValue])

  useEffect(() => {
    if (selectedCategories.length > 0) {
      setValue('category', selectedCategories[0].label)
      setValue('categories', selectedCategories.map(c => c.label))
    } else {
      setValue('category', '')
      setValue('categories', [])
    }
  }, [selectedCategories, setValue])

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/businesses')
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data)
      } else {
        console.error('Failed to fetch businesses: HTTP', response.status)
        setBusinesses([])
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
      setBusinesses([])
    }
  }

  const fetchLocations = async (businessId: string) => {
    try {
      const response = await fetch(`/api/locations?businessId=${businessId}`)
      if (response.ok) {
        const data = await response.json()
        setLocations(data)
      } else {
        console.error('Failed to fetch locations: HTTP', response.status)
        setLocations([])
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error)
      setLocations([])
    }
  }

  const handleBusinessAdded = (business: Business) => {
    setBusinesses(prev => [...prev, business])
    setSelectedBusiness({id: business.id, label: business.name})
    setShowAddBusiness(false)
  }

  const handleLocationAdded = (location: Location) => {
    setLocations(prev => [...prev, location])
    setSelectedLocation({id: location.id, label: location.name})
    setShowAddLocation(false)
  }

  const handleFormSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit(data)
      // Only clear form data on successful submission
      reset()
      setSelectedBusiness(undefined)
      setSelectedLocation(undefined)
      setSelectedCategories([])
    } catch (error) {
      console.error('Failed to submit expense:', error)
      // Set error message for user feedback
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit expense. Please try again.'
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn('space-y-6', className)}
    >
      {/* Error Message */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-red-800">Error submitting expense</p>
            </div>
            <button
              type="button"
              onClick={() => setSubmitError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-red-600 mt-1">{submitError}</p>
        </div>
      )}
      {/* Business Context */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <h4 className="font-semibold text-emerald-900 mb-3">🏢 Business Context</h4>
        <div className="space-y-4">
          {/* Business Selection */}
          {showAddBusiness ? (
            <SimpleBusinessForm
              onBusinessAdded={handleBusinessAdded}
              onCancel={() => setShowAddBusiness(false)}
            />
          ) : (
            <TagSelector
              label="Business"
              tags={businesses.map(b => ({ id: b.id, label: b.name }))}
              selectedTag={selectedBusiness}
              onTagSelect={(tag) => {
                if (tag.id && tag.label) {
                  setSelectedBusiness(tag)
                } else {
                  setSelectedBusiness(undefined)
                }
              }}
              placeholder="Select a business (optional)"
              showAddButton={true}
              onAddTag={() => setShowAddBusiness(true)}
            />
          )}

          {/* Location Selection */}
          {selectedBusiness && (
            showAddLocation ? (
              <SimpleLocationForm
                businessId={selectedBusiness.id}
                businessName={selectedBusiness.label}
                onLocationAdded={handleLocationAdded}
                onCancel={() => setShowAddLocation(false)}
              />
            ) : (
              <TagSelector
                label="Location"
                tags={locations.map(l => ({ id: l.id, label: l.name }))}
                selectedTag={selectedLocation}
                onTagSelect={(tag) => {
                  if (tag.id && tag.label) {
                    setSelectedLocation(tag)
                  } else {
                    setSelectedLocation(undefined)
                  }
                }}
                placeholder="Select a location (optional)"
                showAddButton={true}
                onAddTag={() => setShowAddLocation(true)}
              />
            )
          )}
        </div>
      </div>

      {/* Expense Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">💰 Expense Details</h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Purpose/Reason *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter expense title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register('amount')}
              placeholder="0.00"
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && (
              <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-3">🏷️ Categories *</h4>
        <MultiTagSelector
          label=""
          tags={EXPENSE_CATEGORIES.map(c => ({ id: c, label: c }))}
          selectedTags={selectedCategories}
          onTagsChange={(tags) => {
            const validTags = tags.filter(tag => tag.id && tag.label)
            setSelectedCategories(validTags)
          }}
          placeholder="Select expense categories (required)"
          error={errors.category?.message}
          maxTags={3}
          showAddButton={false}
        />
        <p className="text-xs text-purple-600 mt-2">
          💡 Select 1-3 categories that best describe this expense (at least 1 required)
        </p>
      </div>

      {/* Additional Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">📝 Additional Details</h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendorName">Vendor/Supplier</Label>
            <Input
              id="vendorName"
              {...register('vendorName')}
              placeholder="Enter vendor or supplier name (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expenseCode">Expense Code</Label>
              <Input
                id="expenseCode"
                {...register('expenseCode')}
                placeholder="Enter expense code (optional)"
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="taxDeductible"
                {...register('taxDeductible')}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <Label htmlFor="taxDeductible" className="text-sm font-medium text-gray-900">
                Tax deductible expense
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Enter expense description (optional)"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Adding Expense...' : 'Add Expense'}
      </Button>
      
      {/* Success feedback could be added here if needed */}
    </form>
  )
}