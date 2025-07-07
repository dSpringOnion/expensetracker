'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { EXPENSE_CATEGORIES } from '@/types'
import { cn } from '@/lib/utils'

const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => Promise<void>
  initialData?: Partial<ExpenseFormData>
  className?: string
}

export function ExpenseForm({ onSubmit, initialData, className }: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: initialData?.title || '',
      amount: initialData?.amount || 0,
      category: initialData?.category || '',
      description: initialData?.description || '',
      date: initialData?.date || new Date().toISOString().split('T')[0],
    },
  })

  const handleFormSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      reset()
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

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          id="category"
          {...register('category')}
          className={errors.category ? 'border-red-500' : ''}
        >
          <option value="">Select a category</option>
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
        )}
      </div>

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