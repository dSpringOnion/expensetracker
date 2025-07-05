'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Camera, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoUploadProps {
  onUpload: (file: File) => Promise<void>
  onExtractedData?: (data: { title: string; amount: number; category: string; date: string; description: string }) => void
  className?: string
}

export function PhotoUpload({ onUpload, onExtractedData, className }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<{ title: string; amount: number; category: string; date: string; description: string } | null>(null)

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Create preview
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    setIsUploading(true)
    try {
      await onUpload(file)
      
      // Simulate OCR extraction (in production, this would call an OCR service)
      const mockExtractedData = {
        title: 'Restaurant Receipt',
        amount: 45.99,
        category: 'Food & Dining',
        date: new Date().toISOString().split('T')[0],
        description: 'Extracted from receipt image'
      }
      
      setExtractedData(mockExtractedData)
      onExtractedData?.(mockExtractedData)
    } catch (error) {
      console.error('Failed to upload photo:', error)
      alert('Failed to upload photo. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [onUpload, onExtractedData])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setExtractedData(null)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <Label>Upload Receipt Photo</Label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {previewUrl ? (
            <div className="space-y-4">
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="max-w-full max-h-48 rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2"
                  onClick={clearPreview}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {isUploading && (
                <p className="text-sm text-gray-600">Processing image...</p>
              )}
              {extractedData && (
                <div className="text-left bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Extracted Data:</h4>
                  <ul className="text-sm space-y-1">
                    <li><strong>Title:</strong> {extractedData.title}</li>
                    <li><strong>Amount:</strong> ${extractedData.amount}</li>
                    <li><strong>Category:</strong> {extractedData.category}</li>
                    <li><strong>Date:</strong> {extractedData.date}</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <p className="text-gray-600">
                Drop your receipt image here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="photo-upload"
        />
        <Label htmlFor="photo-upload" className="flex-1">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Processing...' : 'Choose Photo'}
          </Button>
        </Label>
      </div>
    </div>
  )
}