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

interface TagSelectorProps {
  tags: Tag[]
  selectedTag?: Tag
  onTagSelect: (tag: Tag) => void
  placeholder?: string
  className?: string
  label?: string
  error?: string
  showAddButton?: boolean
  onAddTag?: () => void
}

export function TagSelector({
  tags,
  selectedTag,
  onTagSelect,
  placeholder = "Select an option",
  className,
  label,
  error,
  showAddButton = false,
  onAddTag
}: TagSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTags = tags.filter(tag =>
    tag.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleTagClick = (tag: Tag) => {
    onTagSelect(tag)
    setIsExpanded(false)
    setSearchTerm('')
  }

  const clearSelection = () => {
    onTagSelect({ id: '', label: '' }) // Clear the selection by passing empty tag
    setSearchTerm('')
    setIsExpanded(false)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-[#1d1c1d]">{label}</label>
      )}
      
      <div className="relative">
        {/* Selected Tag Display */}
        {selectedTag ? (
          <div className="flex items-center gap-2 p-3 border border-[#d1d1d1] rounded-md bg-white">
            <span 
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#007a5a] text-white"
            >
              {selectedTag.label}
              <button
                type="button"
                onClick={clearSelection}
                className="ml-2 text-white hover:text-gray-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        ) : (
          <div>
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "w-full p-3 border border-[#d1d1d1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#007a5a] focus:border-transparent",
                error && "border-red-500"
              )}
            />
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
      
      {/* Tag Cloud for Quick Selection */}
      {!selectedTag && tags.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-[#616061] self-center">Quick select:</span>
            {(searchTerm ? filteredTags : tags)
              .slice(0, isExpanded ? undefined : 6)
              .map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#f8f8f8] text-[#1d1c1d] border border-[#d1d1d1] hover:bg-[#e8f5e8] hover:border-[#007a5a]/20 hover:text-[#007a5a] transition-colors"
                >
                  {tag.label}
                </button>
              ))
            }
          </div>
          
          {/* Show More/Less Button */}
          {!searchTerm && tags.length > 6 && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-[#007a5a] hover:text-[#005a42] transition-colors"
              >
                {isExpanded ? (
                  <>Show Less</>
                ) : (
                  <>Show {tags.length - 6} More</>
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
                Add New
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}