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
import { FileUpload } from '@/components/ui/file-upload'
import { EXPENSE_CATEGORIES, Business, Location } from '@/types'
import { cn } from '@/lib/utils'

const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
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
  const [selectedCategory, setSelectedCategory] = useState<{id: string, label: string} | undefined>()
  const [receiptFile, setReceiptFile] = useState<File | undefined>()
  
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
    if (selectedCategory) {
      setValue('category', selectedCategory.label)
    }
  }, [selectedCategory, setValue])

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
      setSelectedCategory(undefined)
      setReceiptFile(undefined)
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
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
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

      {/* Business Selection */}
      <TagSelector
        label="Business"
        tags={businesses.map(b => ({ id: b.id, label: b.name }))}
        selectedTag={selectedBusiness}
        onTagSelect={setSelectedBusiness}
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
          onTagSelect={setSelectedLocation}
          placeholder="Select a location (optional)"
          showAddButton={true}
          onAddTag={() => alert('Add new location functionality coming soon!')}
        />
      )}

      {/* Category Selection */}
      <TagSelector
        label="Category *"
        tags={EXPENSE_CATEGORIES.map(c => ({ id: c, label: c }))}
        selectedTag={selectedCategory}
        onTagSelect={(tag) => setSelectedCategory(tag)}
        placeholder="Select a category"
        error={errors.category?.message}
      />

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

      {/* Vendor Name */}
      <div className="space-y-2">
        <Label htmlFor="vendorName">Vendor/Supplier</Label>
        <Input
          id="vendorName"
          {...register('vendorName')}
          placeholder="Enter vendor or supplier name (optional)"
        />
      </div>

      {/* Expense Code */}
      <div className="space-y-2">
        <Label htmlFor="expenseCode">Expense Code</Label>
        <Input
          id="expenseCode"
          {...register('expenseCode')}
          placeholder="Enter expense code (optional)"
        />
      </div>

      {/* Tax Deductible */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="taxDeductible"
          {...register('taxDeductible')}
          className="rounded border-[#d1d1d1] text-[#007a5a] focus:ring-[#007a5a]"
        />
        <Label htmlFor="taxDeductible" className="text-sm font-medium text-[#1d1c1d]">
          Tax deductible expense
        </Label>
      </div>

      {/* Receipt Upload */}
      <FileUpload
        label="Receipt"
        description="Upload receipt image or PDF (optional)"
        onFileSelect={setReceiptFile}
        acceptedTypes="image/*,.pdf"
        maxSize={10}
        onRemove={() => setReceiptFile(undefined)}
      />

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