'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select-radix'
import { Business } from '@/types'

interface AddBusinessModalProps {
  isOpen: boolean
  onClose: () => void
  onBusinessAdded: (business: Business) => void
}

const businessTypes = [
  'Restaurant/Food Service',
  'Retail Store',
  'Professional Services', 
  'Technology/Software',
  'Healthcare',
  'Real Estate',
  'Construction',
  'Manufacturing',
  'Other'
]

export function AddBusinessModal({ isOpen, onClose, onBusinessAdded }: AddBusinessModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    businessType: '',
    taxSettings: {}
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create business')
      }

      const business = await response.json()
      onBusinessAdded(business)
      setFormData({ name: '', businessType: '', taxSettings: {} })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Business</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter business name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Select 
              value={formData.businessType} 
              onValueChange={(value) => setFormData({ ...formData, businessType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Business'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}