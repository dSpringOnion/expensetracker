'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Location } from '@/types'

interface SimpleLocationFormProps {
  onLocationAdded: (location: Location) => void
  onCancel: () => void
  businessId: string
  businessName: string
}

export function SimpleLocationForm({ onLocationAdded, onCancel, businessId, businessName }: SimpleLocationFormProps) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          name: name.trim(),
          address: address.trim() || undefined
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create location')
      }

      const location = await response.json()
      onLocationAdded(location)
      setName('')
      setAddress('')
      onCancel()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Add New Location to {businessName}</h3>
      <div className="space-y-3">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        
        <div>
          <Label htmlFor="locationName">Location Name *</Label>
          <Input
            id="locationName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Downtown Store, Main Office"
            required
          />
        </div>

        <div>
          <Label htmlFor="locationAddress">Address (optional)</Label>
          <Textarea
            id="locationAddress"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter full address"
            rows={2}
          />
        </div>

        <div className="flex gap-2">
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? 'Creating...' : 'Create Location'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}