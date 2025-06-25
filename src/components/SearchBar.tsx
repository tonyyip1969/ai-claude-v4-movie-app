'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Movie } from '@/types/movie';
import { debounce } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onResults: (movies: Movie[]) => void;
  onClear: () => void;
  className?: string;
  placeholder?: string;
}

export default function SearchBar({ 
  onResults, 
  onClear, 
  className, 
  placeholder = "Search movies..." 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        onClear();
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/movies/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        
        if (response.ok) {
          onResults(data.movies || []);
        } else {
          console.error('Search error:', data.error);
          onResults([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        onResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [onResults, onClear]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleClear = () => {
    setQuery('');
    onClear();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger immediate search on form submission
    if (query.trim()) {
      debouncedSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className={cn(
        "relative flex items-center transition-all duration-300",
        "bg-gray-800/50 backdrop-blur-sm border rounded-xl overflow-hidden",
        isFocused 
          ? "border-primary-500 shadow-glow bg-gray-800/70" 
          : "border-gray-600 hover:border-gray-500"
      )}>
        {/* Search Icon */}
        <div className="absolute left-4 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-12 pr-12 py-4 bg-transparent text-white placeholder-gray-400",
            "focus:outline-none focus:ring-0 transition-all duration-300",
            "text-base font-medium"
          )}
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              "absolute right-4 p-1 text-gray-400 hover:text-white transition-colors duration-300",
              "hover:bg-gray-700 rounded-full"
            )}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Status */}
      {query && (
        <div className="absolute top-full left-0 right-0 mt-2 z-10">
          <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3">
            {isLoading ? (
              <div className="flex items-center space-x-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Searching...</span>
              </div>
            ) : (
              <div className="text-sm text-gray-400">
                Press Enter to search for "{query}"
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
