'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Location } from '@/types'

interface AddLocationModalProps {
  isOpen: boolean
  onClose: () => void
  onLocationAdded: (location: Location) => void
  businessId: string
  businessName: string
}

export function AddLocationModal({ 
  isOpen, 
  onClose, 
  onLocationAdded, 
  businessId, 
  businessName 
}: AddLocationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    managerEmail: '',
    settings: {}
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          businessId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create location')
      }

      const location = await response.json()
      onLocationAdded(location)
      setFormData({ name: '', address: '', managerEmail: '', settings: {} })
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
          <DialogTitle>Add New Location</DialogTitle>
          <p className="text-sm text-gray-600">
            Adding location to: <strong>{businessName}</strong>
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="locationName">Location Name *</Label>
            <Input
              id="locationName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Downtown Store, Main Office"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter full address"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="managerEmail">Manager Email</Label>
            <Input
              id="managerEmail"
              type="email"
              value={formData.managerEmail}
              onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
              placeholder="manager@example.com"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Location'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}