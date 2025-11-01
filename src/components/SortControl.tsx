'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, Clock, Calendar, Award, Star } from 'lucide-react';
import { SortOption } from '@/types/movie';

interface SortControlProps {
  value: SortOption;
  onChange: (sortBy: SortOption) => void;
  className?: string;
}

interface SortOptionConfig {
  value: SortOption;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const sortOptions: SortOptionConfig[] = [
  {
    value: 'createdAt',
    label: 'Recently Added',
    icon: <Clock className="w-4 h-4" />,
    description: 'Newest imports first'
  },
  {
    value: 'publishedAt',
    label: 'Publication Date',
    icon: <Calendar className="w-4 h-4" />,
    description: 'Recently published'
  },
  {
    value: 'title',
    label: 'Title (A-Z)',
    icon: <Award className="w-4 h-4" />,
    description: 'Alphabetical order'
  },
  {
    value: 'rating',
    label: 'Rating',
    icon: <Star className="w-4 h-4" />,
    description: 'Highest rated first'
  },
];

/**
 * SortControl component provides a dropdown menu for selecting movie sort options
 * Features:
 * - Four sort options: Recently Added, Publication Date, Title, Rating
 * - Visual indicators for current selection
 * - Keyboard navigation support
 * - Mobile-responsive design
 * - Dark theme styling
 */
export default function SortControl({ value, onChange, className = '' }: SortControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get current option configuration
  const currentOption = sortOptions.find(opt => opt.value === value) || sortOptions[1]; // Default to publishedAt
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);
  
  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };
  
  const handleSelect = (option: SortOption) => {
    onChange(option);
    setIsOpen(false);
  };
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Sort Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 border border-gray-700"
        aria-label="Sort movies"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <ArrowUpDown className="w-4 h-4 text-gray-400" />
        <span className="hidden sm:inline text-sm font-medium">Sort:</span>
        <span className="text-sm font-medium">{currentOption.label}</span>
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            {sortOptions.map((option) => {
              const isSelected = option.value === value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-start space-x-3 px-4 py-3 text-left transition-colors duration-150 ${
                    isSelected
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  role="menuitem"
                  aria-current={isSelected ? 'true' : undefined}
                >
                  <div className={`flex-shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{option.label}</span>
                      {isSelected && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${isSelected ? 'text-primary-100' : 'text-gray-500'}`}>
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
