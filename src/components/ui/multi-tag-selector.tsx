'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface Tag {
  id: string
  label: string
  color?: string
}

interface MultiTagSelectorProps {
  tags: Tag[]
  selectedTags: Tag[]
  onTagsChange: (tags: Tag[]) => void
  placeholder?: string
  className?: string
  label?: string
  error?: string
  maxTags?: number
  showAddButton?: boolean
  onAddTag?: () => void
}

export function MultiTagSelector({
  tags,
  selectedTags,
  onTagsChange,
  placeholder = "Select options",
  className,
  label,
  error,
  maxTags = 5,
  showAddButton = false,
  onAddTag
}: MultiTagSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTags = tags.filter(tag =>
    tag.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTags.some(selected => selected.id === tag.id)
  )

  const handleTagAdd = (tag: Tag) => {
    if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tag])
    }
    setSearchTerm('')
    if (selectedTags.length + 1 >= maxTags) {
      setIsExpanded(false)
    }
  }

  const handleTagRemove = (tagId: string) => {
    onTagsChange(selectedTags.filter(tag => tag.id !== tagId))
  }

  const clearAllSelections = () => {
    onTagsChange([])
    setSearchTerm('')
    setIsExpanded(false)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-900">{label}</label>
          {selectedTags.length > 0 && (
            <button
              type="button"
              onClick={clearAllSelections}
              className="text-xs text-gray-600 hover:text-emerald-600 transition-colors font-medium"
            >
              Clear all
            </button>
          )}
        </div>
      )}
      
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-white min-h-[46px] shadow-sm">
          {selectedTags.map((tag) => (
            <span 
              key={tag.id}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-500 text-white shadow-sm"
            >
              {tag.label}
              <button
                type="button"
                onClick={() => handleTagRemove(tag.id)}
                className="ml-2 text-white hover:text-gray-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {selectedTags.length < maxTags && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-50 transition-all duration-200 shadow-sm"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add category
            </button>
          )}
        </div>
      )}

      {/* Input when no tags selected */}
      {selectedTags.length === 0 && (
        <div className="relative">
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className={cn(
              "w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all duration-200 text-gray-900",
              error && "border-red-300 focus:ring-red-500"
            )}
          />
        </div>
      )}
      
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
      
      {/* Tag Cloud for Selection */}
      {tags.length > 0 && (selectedTags.length === 0 || isExpanded) && (
        <div className="space-y-3">
          {selectedTags.length < maxTags && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-600 font-medium self-center">
                {selectedTags.length === 0 ? 'Quick select:' : 'Add more:'}
              </span>
              {(searchTerm ? filteredTags : filteredTags)
                .slice(0, isExpanded ? undefined : 6)
                .map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagAdd(tag)}
                    disabled={selectedTags.length >= maxTags}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {tag.label}
                  </button>
                ))
              }
            </div>
          )}
          
          {/* Show More/Less Button */}
          {!searchTerm && filteredTags.length > 6 && selectedTags.length < maxTags && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-200"
              >
                {isExpanded ? (
                  <>Show Less</>
                ) : (
                  <>Show {filteredTags.length - 6} More</>
                )}
              </button>
            </div>
          )}
          
          {/* Add New Button */}
          {showAddButton && onAddTag && (
            <div className="pt-2 border-t border-[#e1e1e1]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddTag}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Category
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Selected count indicator */}
      {selectedTags.length > 0 && (
        <div className="text-xs text-gray-600 font-medium">
          {selectedTags.length} of {maxTags} categories selected
        </div>
      )}
    </div>
  )
}