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
import { FileUpload } from '@/components/ui/file-upload'
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
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<{id: string, label: string} | undefined>()
  const [selectedLocation, setSelectedLocation] = useState<{id: string, label: string} | undefined>()
  const [selectedCategories, setSelectedCategories] = useState<{id: string, label: string}[]>([])
  const [receiptFile, setReceiptFile] = useState<File | undefined>()
  const [useReceiptMode, setUseReceiptMode] = useState(false)
  
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
      setValue('category', selectedCategories[0].label) // Primary category for backward compatibility
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
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
    }
  }

  const fetchLocations = async (businessId: string) => {
    try {
      const response = await fetch(`/api/locations?businessId=${businessId}`)
      if (response.ok) {
        const data = await response.json()
        setLocations(data)
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error)
    }
  }

  const handleFormSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit({ ...data, receiptFile })
      reset()
      setSelectedBusiness(undefined)
      setSelectedLocation(undefined)
      setSelectedCategories([])
      setReceiptFile(undefined)
      setUseReceiptMode(false)
    } catch (error) {
      console.error('Failed to submit expense:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn('space-y-6', className)}
    >
      {/* Receipt Mode Toggle */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Do you have a receipt?
            </h3>
            <p className="text-gray-600 mb-4">
              We can extract the amount, vendor, and date automatically from your receipt image!
            </p>
            <button
              type="button"
              onClick={() => setUseReceiptMode(!useReceiptMode)}
              className={cn(
                "inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200",
                useReceiptMode
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
            >
              {useReceiptMode ? (
                <>
                  ✓ Using receipt mode
                </>
              ) : (
                <>
                  📸 Yes, use my receipt
                </>
              )}
            </button>
            {useReceiptMode && (
              <button
                type="button"
                onClick={() => setUseReceiptMode(false)}
                className="ml-3 text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Switch to manual entry
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Receipt Upload - Show first in receipt mode */}
      {useReceiptMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-3">📸 Upload Your Receipt</h4>
          <FileUpload
            label=""
            description="Upload receipt image - we'll extract amount, vendor, and date automatically"
            onFileSelect={setReceiptFile}
            onOCRComplete={(extractedData) => {
              // Pre-fill form with extracted data
              if (extractedData.amount) setValue('amount', extractedData.amount)
              if (extractedData.vendor) setValue('vendorName', extractedData.vendor)
              if (extractedData.date) setValue('date', extractedData.date)
            }}
            acceptedTypes="image/*"
            maxSize={10}
            onRemove={() => setReceiptFile(undefined)}
          />
        </div>
      )}

      {/* Business Context - Always Required */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <h4 className="font-semibold text-emerald-900 mb-3">🏢 Business Context</h4>
        <div className="space-y-4">
          {/* Business Selection */}
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
            onAddTag={() => alert('Add new business functionality coming soon!')}
          />

          {/* Location Selection */}
          {selectedBusiness && (
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
              onAddTag={() => alert('Add new location functionality coming soon!')}
            />
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
              placeholder={useReceiptMode ? "What was this expense for? (e.g., Team lunch, Office supplies)" : "Enter expense title"}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
            {useReceiptMode && (
              <p className="text-xs text-gray-600">
                💡 We extracted vendor info from your receipt - please tell us the business purpose
              </p>
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
            {useReceiptMode && (
              <p className="text-xs text-gray-600">
                💡 Amount was extracted from receipt - please verify it&apos;s correct
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-3">🏷️ Categories</h4>
        <MultiTagSelector
          label=""
          tags={EXPENSE_CATEGORIES.map(c => ({ id: c, label: c }))}
          selectedTags={selectedCategories}
          onTagsChange={(tags) => {
            // Filter out empty tags from the clear function
            const validTags = tags.filter(tag => tag.id && tag.label)
            setSelectedCategories(validTags)
          }}
          placeholder="Select expense categories"
          error={errors.category?.message}
          maxTags={3}
          showAddButton={true}
          onAddTag={() => alert('Add new category functionality coming soon!')}
        />
        <p className="text-xs text-purple-600 mt-2">
          💡 Select up to 3 categories that best describe this expense
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
            {useReceiptMode && (
              <p className="text-xs text-gray-600">
                💡 Date was extracted from receipt - please verify it&apos;s correct
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendorName">Vendor/Supplier</Label>
            <Input
              id="vendorName"
              {...register('vendorName')}
              placeholder={useReceiptMode ? "Vendor extracted from receipt" : "Enter vendor or supplier name (optional)"}
              className={useReceiptMode ? 'bg-blue-50' : ''}
            />
            {useReceiptMode && (
              <p className="text-xs text-gray-600">
                💡 Vendor was extracted from receipt - you can edit if needed
              </p>
            )}
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
    </form>
  )
}