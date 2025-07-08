'use client'

import { useState } from 'react'
import { X, Eye, Download, FileText } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ReceiptViewerProps {
  receiptUrl: string
  expenseTitle: string
  className?: string
}

export function ReceiptViewer({ receiptUrl, expenseTitle, className }: ReceiptViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isImage = receiptUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  const isPDF = receiptUrl.match(/\.pdf$/i)

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(receiptUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `receipt-${expenseTitle.replace(/[^a-zA-Z0-9]/g, '-')}.${receiptUrl.split('.').pop()}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download receipt:', error)
      alert('Failed to download receipt')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Thumbnail/Trigger */}
      <div className={cn('relative group cursor-pointer', className)}>
        {isImage ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={receiptUrl}
              alt={`Receipt for ${expenseTitle}`}
              className="w-12 h-12 object-cover rounded-lg border border-[#e1e1e1] group-hover:border-[#007a5a] transition-colors"
              onClick={() => setIsOpen(true)}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-all">
              <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ) : (
          <div 
            className="w-12 h-12 bg-[#f8f8f8] border border-[#e1e1e1] rounded-lg flex items-center justify-center group-hover:border-[#007a5a] transition-colors"
            onClick={() => setIsOpen(true)}
          >
            <FileText className="h-6 w-6 text-[#007a5a]" />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg flex items-center justify-center transition-all">
              <Eye className="h-4 w-4 text-[#007a5a] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="relative bg-white rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#e1e1e1]">
              <h3 className="text-lg font-semibold text-[#1d1c1d] truncate">
                Receipt - {expenseTitle}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isLoading ? 'Downloading...' : 'Download'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {isImage ? (
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={receiptUrl}
                    alt={`Receipt for ${expenseTitle}`}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
              ) : isPDF ? (
                <div className="w-full h-96">
                  <iframe
                    src={receiptUrl}
                    className="w-full h-full border border-[#e1e1e1] rounded-lg"
                    title={`Receipt for ${expenseTitle}`}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-[#616061] mx-auto mb-4" />
                  <p className="text-[#616061] mb-4">
                    Preview not available for this file type
                  </p>
                  <Button onClick={handleDownload} disabled={isLoading}>
                    <Download className="h-4 w-4 mr-2" />
                    {isLoading ? 'Downloading...' : 'Download File'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}