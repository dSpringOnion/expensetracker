'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Business } from '@/types'

interface SimpleBusinessFormProps {
  onBusinessAdded: (business: Business) => void
  onCancel: () => void
}

export function SimpleBusinessForm({ onBusinessAdded, onCancel }: SimpleBusinessFormProps) {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          businessType: 'Other'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create business')
      }

      const business = await response.json()
      onBusinessAdded(business)
      setName('')
      onCancel()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Add New Business</h3>
      <div className="space-y-3">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        
        <div>
          <Label htmlFor="businessName">Business Name *</Label>
          <Input
            id="businessName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter business name"
            required
          />
        </div>

        <div className="flex gap-2">
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? 'Creating...' : 'Create Business'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}