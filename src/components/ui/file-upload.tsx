'use client'

import { useState, useCallback } from 'react'
import { Button } from './button'
import { Label } from './label'
import { Upload, X, FileText, Image } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  acceptedTypes?: string
  maxSize?: number // in MB
  label?: string
  description?: string
  className?: string
  error?: string
  currentFile?: string // URL of currently uploaded file
  onRemove?: () => void
  showPreview?: boolean
}

export function FileUpload({
  onFileSelect,
  acceptedTypes = "image/*",
  maxSize = 10,
  label,
  description,
  className,
  error,
  currentFile,
  onRemove,
  showPreview = true
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentFile || null)

  const handleFileSelect = useCallback((file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return
    }

    // Create preview for images
    if (file.type.startsWith('image/') && showPreview) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }

    onFileSelect(file)
  }, [onFileSelect, maxSize, showPreview])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input value to allow selecting the same file again
    event.target.value = ''
  }

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleRemove = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    onRemove?.()
  }

  const isImage = previewUrl && (currentFile?.includes('image') || previewUrl.startsWith('blob:'))

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="text-[#1d1c1d] font-semibold">{label}</Label>
      )}
      
      {/* File Preview */}
      {previewUrl && (
        <div className="relative inline-block mb-4">
          {isImage ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="File preview"
                className="max-w-full max-h-32 rounded-lg border border-[#e1e1e1]"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 border border-[#e1e1e1] rounded-lg bg-[#f8f8f8]">
              <FileText className="h-6 w-6 text-[#007a5a]" />
              <span className="text-sm text-[#1d1c1d] truncate max-w-48">
                {currentFile?.split('/').pop() || 'Uploaded file'}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Upload Area */}
      {!previewUrl && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            isDragOver
              ? "border-[#007a5a] bg-[#e8f5e8]"
              : "border-[#d1d1d1] bg-[#f8f8f8] hover:border-[#007a5a]",
            error && "border-red-500"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="flex space-x-2">
                <Upload className="h-8 w-8 text-[#007a5a]" />
                {acceptedTypes.includes('image') && <Image className="h-8 w-8 text-[#007a5a]" />}
              </div>
            </div>
            <p className="text-[#1d1c1d] font-medium">
              Drop your file here, or click to select
            </p>
            {description && (
              <p className="text-sm text-[#616061]">
                {description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* File Input */}
      <div className="flex gap-2">
        <input
          type="file"
          accept={acceptedTypes}
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <Label htmlFor="file-upload" className="flex-1">
          <Button
            type="button"
            variant="outline"
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {previewUrl ? 'Change File' : 'Choose File'}
          </Button>
        </Label>
      </div>

      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}