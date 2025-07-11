'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'

interface ImportError {
  row: number
  field: string
  message: string
}

interface ImportPreview {
  validRows: number
  totalRows: number
  errors: ImportError[]
  data: {
    Date: string
    Title: string
    Amount: number
    Category: string
    Business: string
    Location: string
    Vendor?: string
    'Expense Code'?: string
    Description?: string
    'Tax Deductible'?: string
  }[]
}

export function ImportSection() {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null)
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const file = files[0]
    
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.csv'))) {
      setSelectedFile(file)
      setImportPreview(null)
      setImportResult(null)
    } else {
      alert('Please select an Excel (.xlsx) or CSV (.csv) file')
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setImportPreview(null)
      setImportResult(null)
    }
  }

  const validateFile = async () => {
    if (!selectedFile) return

    setIsValidating(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/expenses/import/validate', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Validation failed')
      }

      const preview = await response.json()
      setImportPreview(preview)
    } catch (error) {
      console.error('Validation failed:', error)
      alert('File validation failed. Please check your file format.')
    } finally {
      setIsValidating(false)
    }
  }

  const processImport = async () => {
    if (!selectedFile) return

    setIsImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/expenses/import/process', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Import failed')
      }

      const result = await response.json()
      setImportResult({ success: true, message: `Successfully imported ${result.count} expenses` })
      setSelectedFile(null)
      setImportPreview(null)
    } catch (error) {
      console.error('Import failed:', error)
      setImportResult({ success: false, message: 'Import failed. Please try again.' })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Spreadsheet
        </h4>
        
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop your Excel or CSV file here
          </p>
          <p className="text-sm text-gray-600 mb-4">
            or click to browse and select a file
          </p>
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 cursor-pointer transition-colors"
          >
            <Upload className="h-4 w-4" />
            Choose File
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: Excel (.xlsx), CSV (.csv) • Max size: 10MB
          </p>
        </div>

        {selectedFile && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-blue-600">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button
                onClick={validateFile}
                disabled={isValidating}
                size="sm"
                variant="outline"
              >
                {isValidating ? 'Validating...' : 'Validate'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Validation Results */}
      {importPreview && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            {importPreview.errors.length === 0 ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
            Validation Results
          </h4>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{importPreview.totalRows}</div>
              <div className="text-sm text-blue-800">Total Rows</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{importPreview.validRows}</div>
              <div className="text-sm text-green-800">Valid Rows</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{importPreview.errors.length}</div>
              <div className="text-sm text-red-800">Errors</div>
            </div>
          </div>

          {importPreview.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h5 className="font-medium text-red-900 mb-2">Validation Errors:</h5>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {importPreview.errors.slice(0, 10).map((error, index) => (
                  <div key={index} className="text-sm text-red-700">
                    Row {error.row}: {error.field} - {error.message}
                  </div>
                ))}
                {importPreview.errors.length > 10 && (
                  <div className="text-sm text-red-600 font-medium">
                    ... and {importPreview.errors.length - 10} more errors
                  </div>
                )}
              </div>
            </div>
          )}

          {importPreview.validRows > 0 && (
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => {
                  setSelectedFile(null)
                  setImportPreview(null)
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={processImport}
                disabled={isImporting || importPreview.validRows === 0}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isImporting ? 'Importing...' : `Import ${importPreview.validRows} Expenses`}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Import Result */}
      {importResult && (
        <div className={`border rounded-lg p-4 ${
          importResult.success
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {importResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span className={`font-medium ${
              importResult.success ? 'text-green-900' : 'text-red-900'
            }`}>
              {importResult.message}
            </span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-amber-900 mb-2">Import Instructions</h4>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Download the template first to ensure proper format</li>
          <li>• Required fields: Date, Title, Amount, Category, Business, Location</li>
          <li>• Date format must be YYYY-MM-DD (e.g., 2025-07-10)</li>
          <li>• Amount must be a positive number</li>
          <li>• Categories and businesses must match existing ones or will be created</li>
          <li>• Maximum 1000 expenses per import</li>
          <li>• File size limit: 10MB</li>
        </ul>
      </div>
    </div>
  )
}