'use client'

import { useState, useCallback } from 'react'
import { Button } from './button'
import { Label } from './label'
import { Upload, X, FileText, Image, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import Tesseract from 'tesseract.js'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onOCRComplete?: (extractedData: {
    title?: string
    amount?: number
    vendor?: string
    date?: string
    description?: string
  }) => void
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
  onOCRComplete,
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
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [extractedData, setExtractedData] = useState<{
    title?: string
    amount?: number
    vendor?: string
    date?: string
    description?: string
  } | null>(null)

  const performOCR = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/') || !onOCRComplete) return

    setIsProcessingOCR(true)
    setOcrProgress(0)

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100))
          }
        }
      })

      const text = result.data.text
      console.log('OCR Text:', text)

      // Simple text parsing for receipt data
      const extractedData = parseReceiptText(text)
      setExtractedData(extractedData)
      onOCRComplete(extractedData)

    } catch (error) {
      console.error('OCR Error:', error)
    } finally {
      setIsProcessingOCR(false)
      setOcrProgress(0)
    }
  }, [onOCRComplete])

  const parseReceiptText = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    let title = ''
    let amount = 0
    let vendor = ''
    let date = ''
    
    // Look for vendor name (usually first few lines)
    const vendorLine = lines.find(line => 
      line.length > 3 && 
      !line.match(/^\d/) && 
      !line.toLowerCase().includes('receipt') &&
      !line.toLowerCase().includes('total')
    )
    if (vendorLine) {
      vendor = vendorLine
      title = `${vendorLine} Receipt`
    }

    // Look for amounts ($ followed by numbers)
    const amountMatches = text.match(/\$?\s*(\d+\.?\d*)/g)
    if (amountMatches) {
      const amounts = amountMatches
        .map(match => parseFloat(match.replace(/[$\s]/g, '')))
        .filter(num => num > 0 && num < 10000)
      
      if (amounts.length > 0) {
        amount = Math.max(...amounts) // Usually the total is the largest amount
      }
    }

    // Look for dates
    const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g)
    if (dateMatch) {
      const dateStr = dateMatch[0]
      const parsedDate = new Date(dateStr)
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().split('T')[0]
      }
    }

    return {
      title: title || 'Receipt',
      amount: amount || undefined,
      vendor: vendor || undefined,
      date: date || undefined,
      description: 'Extracted from receipt via OCR'
    }
  }

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

    // Perform OCR if it's an image and callback is provided
    if (file.type.startsWith('image/') && onOCRComplete) {
      performOCR(file)
    }
  }, [onFileSelect, maxSize, showPreview, onOCRComplete, performOCR])

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
              <img
                src={previewUrl}
                alt="Receipt preview"
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

      {/* OCR Processing */}
      {isProcessingOCR && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-blue-600 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Reading receipt text...</p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-700 mt-1">{ocrProgress}% complete</p>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Data Display */}
      {extractedData && !isProcessingOCR && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Text Extracted from Receipt:
          </h4>
          <div className="space-y-1 text-sm text-green-800">
            {extractedData.vendor && (
              <p><strong>Vendor:</strong> {extractedData.vendor}</p>
            )}
            {extractedData.amount && (
              <p><strong>Amount:</strong> ${extractedData.amount}</p>
            )}
            {extractedData.date && (
              <p><strong>Date:</strong> {extractedData.date}</p>
            )}
            <p className="text-xs text-green-600 mt-2">
              This data has been pre-filled in the form below
            </p>
          </div>
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