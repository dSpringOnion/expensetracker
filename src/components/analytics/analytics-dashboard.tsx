'use client'

import React, { useState } from 'react'
import TrendChart from './trend-chart'
import SpendingPatterns from './spending-patterns'
import VendorAnalysis from './vendor-analysis'
import BudgetForecast from './budget-forecast'
import CustomReportBuilder from './custom-report-builder'

interface AnalyticsDashboardProps {
  className?: string
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'vendors' | 'forecasts' | 'reports'>('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'patterns', label: 'Patterns', icon: '📈' },
    { id: 'vendors', label: 'Vendors', icon: '🏪' },
    { id: 'forecasts', label: 'Forecasts', icon: '🔮' },
    { id: 'reports', label: 'Reports', icon: '📋' }
  ] as const

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">Advanced Analytics</h2>
        <p className="text-sm text-gray-700 mt-1">
          Comprehensive insights into your spending patterns and budget performance
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <TrendChart />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SpendingPatterns />
              <BudgetForecast />
            </div>
          </div>
        )}

        {activeTab === 'patterns' && (
          <SpendingPatterns />
        )}

        {activeTab === 'vendors' && (
          <VendorAnalysis />
        )}

        {activeTab === 'forecasts' && (
          <BudgetForecast />
        )}

        {activeTab === 'reports' && (
          <CustomReportBuilder />
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="text-xs text-gray-700">
          <span className="font-medium">Pro Tip:</span> Use the different tabs to explore various aspects of your spending data. 
          The Overview tab provides a comprehensive dashboard, while specialized tabs offer detailed analysis.
        </div>
      </div>
    </div>
  )
}