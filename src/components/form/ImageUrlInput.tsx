import React, { useState } from 'react';
import Image from 'next/image';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { MovieFormData } from '@/lib/movie-validation';

interface ImageUrlInputProps {
  name: 'coverUrl' | 'videoUrl';
  label: string;
  placeholder?: string;
  register: UseFormRegister<MovieFormData>;
  errors: FieldErrors<MovieFormData>;
  watch: UseFormWatch<MovieFormData>;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Image URL Input Component
 * 
 * Provides URL input with optional manual image preview functionality.
 * User can manually trigger preview to verify the image URL.
 */
export function ImageUrlInput({
  name,
  label,
  placeholder,
  register,
  errors,
  watch,
  disabled = false,
  required = false,
}: ImageUrlInputProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [imageLoadState, setImageLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  
  const watchedValue = watch(name);

  const handlePreviewToggle = () => {
    if (showPreview) {
      setShowPreview(false);
    } else {
      setShowPreview(true);
      setImageLoadState('loading');
    }
  };

  const handleImageLoad = () => {
    setImageLoadState('loaded');
  };

  const handleImageError = () => {
    setImageLoadState('error');
  };

  const error = errors[name];
  const hasError = !!error;

  return (
    <div className="space-y-2">
      {/* Label */}
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Field */}
      <div className="relative">
        <input
          {...register(name)}
          id={name}
          type="url"
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm
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
        
        {/* Preview Toggle Button */}
        {watchedValue && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <button
              type="button"
              onClick={handlePreviewToggle}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
              disabled={disabled}
            >
              {showPreview ? 'Hide' : 'Preview'}
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error.message}
        </p>
      )}

      {/* Manual Image Preview */}
      {showPreview && watchedValue && (
        <div className="mt-3">
          <div className="relative inline-block">
            {imageLoadState === 'loading' && (
              <div className="w-32 h-20 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {imageLoadState === 'loaded' && (
              <div className="relative group">
                <Image
                  src={watchedValue}
                  alt={`${label} preview`}
                  width={128}
                  height={80}
                  className="w-32 h-20 object-cover rounded-md border border-gray-200 dark:border-gray-600"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{ display: imageLoadState === 'loaded' ? 'block' : 'none' }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-md"></div>
              </div>
            )}

            {/* Hidden image for loading test */}
            {imageLoadState === 'loading' && (
              <Image
                src={watchedValue}
                alt=""
                width={1}
                height={1}
                className="hidden"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}
            
            {imageLoadState === 'error' && (
              <div className="w-32 h-20 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-6 h-6 text-red-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-red-600 dark:text-red-400">Failed to load</p>
                </div>
              </div>
            )}
          </div>
          
          {imageLoadState === 'loaded' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Preview loaded successfully
            </p>
          )}
        </div>
      )}
    </div>
  );
}
