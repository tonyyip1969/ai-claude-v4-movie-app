import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { MovieFormData } from '@/lib/movie-validation';

interface UrlInputProps {
  name: 'videoUrl' | 'coverUrl';
  label: string;
  placeholder?: string;
  register: UseFormRegister<MovieFormData>;
  errors: FieldErrors<MovieFormData>;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
  icon?: 'video' | 'image' | 'link';
}

/**
 * URL Input Component for Video and Cover URLs
 * 
 * Provides URL input with proper validation and visual feedback.
 * Includes icons and helper text for better UX.
 */
export function UrlInput({
  name,
  label,
  placeholder,
  register,
  errors,
  disabled = false,
  required = false,
  helpText,
  icon = 'link',
}: UrlInputProps) {
  const error = errors[name];
  const hasError = !!error;

  const getIcon = () => {
    switch (icon) {
      case 'video':
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'image':
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Field */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {getIcon()}
        </div>
        
        <input
          {...register(name)}
          id={name}
          type="url"
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-3 py-2 border rounded-md shadow-sm
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
            dark:bg-gray-800 dark:border-gray-600 dark:text-white
            ${hasError 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 dark:border-gray-600'
            }
          `}
        />
      </div>

      {/* Help Text */}
      {helpText && !hasError && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error.message}
        </p>
      )}
    </div>
  );
}
