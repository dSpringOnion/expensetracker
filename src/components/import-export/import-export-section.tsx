'use client'

import { useState } from 'react'
import { ExportSection } from './export-section'
import { ImportSection } from './import-section'

export function ImportExportSection() {
  const [activeSection, setActiveSection] = useState<'export' | 'import'>('export')

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveSection('export')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeSection === 'export'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📤 Export Data
        </button>
        <button
          onClick={() => setActiveSection('import')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeSection === 'import'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📥 Import Data
        </button>
      </div>

      {activeSection === 'export' && <ExportSection />}
      {activeSection === 'import' && <ImportSection />}
    </div>
  )
}