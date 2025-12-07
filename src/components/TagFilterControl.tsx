'use client';

import { useState, useEffect, useRef } from 'react';
import { Tag as TagIcon, X, Check } from 'lucide-react';
import { Tag } from '@/lib/database';

interface TagFilterControlProps {
    selectedTag?: string;
    onTagSelect: (tag: string | undefined) => void;
    className?: string;
}

export default function TagFilterControl({ selectedTag, onTagSelect, className = '' }: TagFilterControlProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tags, setTags] = useState<Tag[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch tags for the list
        const fetchTags = async () => {
            try {
                const res = await fetch('/api/tags');
                if (res.ok) {
                    const data = await res.json();
                    setTags(data);
                }
            } catch (err) {
                console.error('Failed to fetch tags for filter:', err);
            }
        };
        fetchTags();
    }, []);

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

    const handleSelect = (tagName: string | undefined) => {
        onTagSelect(tagName);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 border ${selectedTag
                        ? 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-700'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
            >
                <TagIcon className="w-4 h-4" />
                <span className="text-sm font-medium">
                    {selectedTag ? selectedTag : 'Filter by Tag'}
                </span>
                {selectedTag && (
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            onTagSelect(undefined);
                        }}
                        className="ml-1 hover:text-red-300 rounded-full p-0.5"
                    >
                        <X className="w-3 h-3" />
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
                    <div className="p-2">
                        <button
                            onClick={() => handleSelect(undefined)}
                            className={`w-full text-left px-3 py-2 rounded text-sm ${!selectedTag ? 'bg-indigo-600/20 text-indigo-300' : 'text-gray-300 hover:bg-gray-700/50'
                                }`}
                        >
                            All Movies
                        </button>
                        {tags.map(tag => (
                            <button
                                key={tag.id}
                                onClick={() => handleSelect(tag.name)}
                                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded text-sm mt-1 ${selectedTag === tag.name
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700/50'
                                    }`}
                            >
                                <span>{tag.name}</span>
                                {tag.count !== undefined && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${selectedTag === tag.name ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-400'
                                        }`}>
                                        {tag.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
