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
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTags = tags.filter(tag =>
    tag.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleTagClick = (tag: Tag) => {
    onTagSelect(tag)
    setIsOpen(false)
    setSearchTerm('')
  }

  const clearSelection = () => {
    setSearchTerm('')
    setIsOpen(false)
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
              onFocus={() => setIsOpen(true)}
              className={cn(
                "w-full p-3 border border-[#d1d1d1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#007a5a] focus:border-transparent",
                error && "border-red-500"
              )}
            />
            
            {/* Dropdown */}
            {isOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-[#d1d1d1] rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredTags.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {filteredTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagClick(tag)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-[#f8f8f8] transition-colors"
                      >
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#e8f5e8] text-[#007a5a] border border-[#007a5a]/20">
                          {tag.label}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-[#616061]">
                    No options found
                  </div>
                )}
                
                {showAddButton && onAddTag && (
                  <div className="border-t border-[#e1e1e1] p-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onAddTag()
                        setIsOpen(false)
                      }}
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
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
      
      {/* Tag Cloud for Quick Selection */}
      {!selectedTag && !isOpen && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-[#616061] self-center">Quick select:</span>
          {tags.slice(0, 6).map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#f8f8f8] text-[#1d1c1d] border border-[#d1d1d1] hover:bg-[#e8f5e8] hover:border-[#007a5a]/20 hover:text-[#007a5a] transition-colors"
            >
              {tag.label}
            </button>
          ))}
          {tags.length > 6 && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#f8f8f8] text-[#616061] border border-[#d1d1d1] hover:bg-[#e8f5e8] transition-colors"
            >
              +{tags.length - 6} more
            </button>
          )}
        </div>
      )}
    </div>
  )
}