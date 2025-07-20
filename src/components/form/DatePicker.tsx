import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { MovieFormData } from '@/lib/movie-validation';

interface DatePickerProps {
  name: 'publishedAt';
  label: string;
  register: UseFormRegister<MovieFormData>;
  errors: FieldErrors<MovieFormData>;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
}

/**
 * Date Picker Component for Published Date
 * 
 * Provides a native date input with proper validation and formatting.
 * Includes helper text and validation feedback.
 */
export function DatePicker({
  name,
  label,
  register,
  errors,
  disabled = false,
  required = false,
  helpText,
}: DatePickerProps) {
  const error = errors[name];
  const hasError = !!error;
  
  // Get today's date in YYYY-MM-DD format for max attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-2">
      {/* Label */}
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Date Input */}
      <div className="relative">
        <input
          {...register(name)}
          id={name}
          type="date"
          max={today}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
            dark:bg-gray-800 dark:border-gray-600 dark:text-white
            ${hasError 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 dark:border-gray-600'
            }
          `}
        />
        
        {/* Calendar icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* Help Text */}
      {helpText && !hasError && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error.message}
        </p>
      )}
    </div>
  );
}
