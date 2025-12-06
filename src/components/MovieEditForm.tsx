import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Movie, MovieUpdatePayload, MovieCreatePayload } from '@/types/movie';
import { validateCodeUniqueness } from '@/lib/movie-validation';

interface MovieEditFormProps {
  movie?: Movie; // Made optional for creation mode
  onSave?: (updates: MovieUpdatePayload) => void; // Made optional for creation mode
  onCreate?: (movieData: MovieCreatePayload) => void; // New prop for creation
  onCancel: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  mode?: 'edit' | 'create'; // New prop to specify mode
  onCreateSuccess?: () => void; // Callback for successful creation
}

// Add ref interface for external access to resetForm
export interface MovieEditFormRef {
  resetForm: () => void;
}

/**
 * Movie Edit/Create Form Component
 * Supports both editing existing movies and creating new ones
 */
export const MovieEditForm = forwardRef<MovieEditFormRef, MovieEditFormProps>(({
  movie,
  onSave,
  onCreate,
  onCancel,
  isLoading = false,
  disabled = false,
  mode = movie ? 'edit' : 'create',
}, ref) => {
  // Default form data for creation mode
  const getDefaultFormData = () => ({
    title: '',
    description: '',
    code: '',
    publishedAt: new Date().toISOString().split('T')[0], // Today's date
    coverUrl: '',
    videoUrl: '',
    rating: 5, // Default rating
  });

  const [formData, setFormData] = useState(
    mode === 'create' ? getDefaultFormData() : {
      title: movie?.title || '',
      description: movie?.description || '',
      code: movie?.code || '',
      publishedAt: movie?.publishedAt || '',
      coverUrl: movie?.coverUrl || '',
      videoUrl: movie?.videoUrl || '',
      rating: movie?.rating || 5,
    }
  );

  const [isDirty, setIsDirty] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Code validation state
  const [isCodeValidating, setIsCodeValidating] = useState(false);
  const [codeValidationStatus, setCodeValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [hasCodeBlurred, setHasCodeBlurred] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Initialize form data
  useEffect(() => {
    if (mode === 'edit' && movie) {
      const initialData = {
        title: movie.title || '',
        description: movie.description || '',
        code: movie.code || '',
        publishedAt: movie.publishedAt || '',
        coverUrl: movie.coverUrl || '',
        videoUrl: movie.videoUrl || '',
        rating: movie.rating || 5,
      };
      setFormData(initialData);
      setIsDirty(false);
    } else if (mode === 'create') {
      // Reset to defaults for creation mode
      setFormData(getDefaultFormData());
      setIsDirty(false);
    }
  }, [movie, mode]);

  // Reset form after successful creation
  const resetForm = () => {
    setFormData(getDefaultFormData());
    setIsDirty(false);
    setShowImagePreview(false);
    setImageError(false);
    // Reset code validation state
    setIsCodeValidating(false);
    setCodeValidationStatus('idle');
    setCodeError(null);
    setHasCodeBlurred(false);
  };

  // Validate code uniqueness
  const validateCode = useCallback(async (code: string) => {
    if (!code || code.length < 3) {
      setCodeValidationStatus('idle');
      setCodeError(null);
      return;
    }

    // Cancel any pending validation request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsCodeValidating(true);
    
    try {
      const currentMovieId = mode === 'edit' && movie ? movie.id : 0;
      const result = await validateCodeUniqueness(code, currentMovieId, abortControllerRef.current.signal);
      
      if (result === true) {
        setCodeValidationStatus('valid');
        setCodeError(null);
      } else {
        setCodeValidationStatus('invalid');
        setCodeError(result);
      }
    } catch {
      // On error, remain in idle state (fail open)
      setCodeValidationStatus('idle');
      setCodeError(null);
    } finally {
      setIsCodeValidating(false);
    }
  }, [mode, movie]);

  // Handle code input blur - trigger validation
  const handleCodeBlur = useCallback(() => {
    setHasCodeBlurred(true);
    if (formData.code && formData.code.length >= 3) {
      validateCode(formData.code);
    }
  }, [formData.code, validateCode]);

  // Re-validate code when it changes after blur
  useEffect(() => {
    if (hasCodeBlurred && formData.code && formData.code.length >= 3) {
      const timeoutId = setTimeout(() => {
        validateCode(formData.code);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else if (!formData.code || formData.code.length < 3) {
      setCodeValidationStatus('idle');
      setCodeError(null);
    }
  }, [formData.code, hasCodeBlurred, validateCode]);

  // Handle input changes
  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Check if form is dirty
      if (mode === 'create') {
        // In create mode, form is dirty if any required field has content
        const hasContent = newData.title.trim() || newData.code.trim() || 
                          newData.videoUrl.trim() || newData.coverUrl.trim();
        setIsDirty(!!hasContent);
      } else if (mode === 'edit' && movie) {
        // In edit mode, check against original values
        const originalData = {
          title: movie.title || '',
          description: movie.description || '',
          code: movie.code || '',
          publishedAt: movie.publishedAt || '',
          coverUrl: movie.coverUrl || '',
          videoUrl: movie.videoUrl || '',
          rating: movie.rating || 5,
        };
        
        const dirty = Object.keys(newData).some(key => 
          newData[key as keyof typeof newData] !== originalData[key as keyof typeof originalData]
        );
        setIsDirty(dirty);
      }
      return newData;
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'create') {
      // Create mode: prepare creation payload
      if (onCreate) {
        const movieData: MovieCreatePayload = {
          title: formData.title.trim(),
          code: formData.code.trim(),
          videoUrl: formData.videoUrl.trim(),
          coverUrl: formData.coverUrl.trim(),
          description: formData.description.trim() || undefined,
          publishedAt: formData.publishedAt || undefined,
          rating: formData.rating,
        };
        onCreate(movieData);
        
        // Note: Form reset should be triggered by parent component on success
        // via the ref's resetForm method to preserve values on error
      }
    } else {
      // Edit mode: prepare update payload
      if (movie && onSave) {
        const updates: MovieUpdatePayload = {};
        
        if (formData.title !== (movie.title || '')) updates.title = formData.title;
        if (formData.description !== (movie.description || '')) updates.description = formData.description;
        if (formData.code !== (movie.code || '')) updates.code = formData.code;
        if (formData.publishedAt !== (movie.publishedAt || '')) updates.publishedAt = formData.publishedAt;
        if (formData.coverUrl !== (movie.coverUrl || '')) updates.coverUrl = formData.coverUrl;
        if (formData.videoUrl !== (movie.videoUrl || '')) updates.videoUrl = formData.videoUrl;

        onSave(updates);
      }
    }
  };

  // Expose resetForm method to parent components
  useImperativeHandle(ref, () => ({
    resetForm,
  }));

  const isFormDisabled = disabled || isLoading;

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {mode === 'create' ? 'Create New Movie' : 'Edit Movie Details'}
          </h2>
          
          {/* Movie Code - With blur validation */}
          <div className="mb-4">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Movie Code <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="code"
                type="text"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                onBlur={handleCodeBlur}
                placeholder="UNIQUE-MOVIE-CODE"
                disabled={isFormDisabled}
                aria-describedby={codeError ? 'code-error' : 'code-help'}
                aria-invalid={!!codeError}
                className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white font-mono text-sm uppercase ${
                  codeError 
                    ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : codeValidationStatus === 'valid'
                    ? 'border-green-300 dark:border-green-500 focus:border-green-500 focus:ring-green-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              
              {/* Status Indicator */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isCodeValidating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                )}
                
                {!isCodeValidating && codeValidationStatus === 'valid' && !codeError && (
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                
                {!isCodeValidating && (codeValidationStatus === 'invalid' || codeError) && (
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            </div>
            
            {/* Help Text */}
            {!codeError && codeValidationStatus !== 'valid' && !isCodeValidating && (
              <p id="code-help" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Unique identifier for the movie (3-20 characters, letters, numbers, hyphens, underscores)
              </p>
            )}
            
            {/* Error Message */}
            {codeError && (
              <p id="code-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {codeError}
              </p>
            )}
            
            {/* Loading indicator */}
            {isCodeValidating && (
              <p className="mt-1 text-sm text-blue-600 dark:text-blue-400 flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-2"></div>
                Checking availability...
              </p>
            )}
          </div>

          {/* Title */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter movie title"
              disabled={isFormDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              placeholder="Enter movie description (optional)"
              disabled={isFormDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white resize-vertical"
            />
          </div>

          {/* Published Date and Rating - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Published Date */}
            <div>
              <label htmlFor="publishedAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Published Date
              </label>
              <input
                id="publishedAt"
                type="date"
                value={formData.publishedAt}
                onChange={(e) => handleChange('publishedAt', e.target.value)}
                disabled={isFormDisabled}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Rating */}
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating (1-10)
              </label>
              <select
                id="rating"
                value={formData.rating}
                onChange={(e) => handleChange('rating', parseInt(e.target.value))}
                disabled={isFormDisabled}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
                  <option key={rating} value={rating}>
                    {rating} {rating === 5 ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cover URL with Preview */}
          <div className="mb-4">
            <label htmlFor="coverUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cover Image URL <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  id="coverUrl"
                  type="url"
                  value={formData.coverUrl}
                  onChange={(e) => {
                    handleChange('coverUrl', e.target.value);
                    setShowImagePreview(false);
                    setImageError(false);
                  }}
                  placeholder="https://example.com/cover-image.jpg"
                  disabled={isFormDisabled}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (formData.coverUrl) {
                      setShowImagePreview(!showImagePreview);
                      setImageError(false);
                    }
                  }}
                  disabled={!formData.coverUrl || isFormDisabled}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showImagePreview ? 'Hide' : 'Preview'}
                </button>
              </div>
              
              {/* Image Preview */}
              {showImagePreview && formData.coverUrl && (
                <div className="mt-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {imageLoading && (
                        <div className="w-48 h-32 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                      {!imageLoading && !imageError && (
                        <Image
                          src={formData.coverUrl}
                          alt="Cover preview"
                          width={192}
                          height={128}
                          className="w-48 h-32 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                          onLoad={() => setImageLoading(false)}
                          onError={() => {
                            setImageError(true);
                            setImageLoading(false);
                          }}
                          onLoadStart={() => setImageLoading(true)}
                        />
                      )}
                      {imageError && (
                        <div className="w-48 h-32 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center border border-gray-300 dark:border-gray-600">
                          <div className="text-center">
                            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="mt-1 text-xs text-gray-500">Failed to load</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Preview of cover image
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 break-all">
                        {formData.coverUrl}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Video URL */}
          <div className="mb-6">
            <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video URL <span className="text-red-500">*</span>
            </label>
            <input
              id="videoUrl"
              type="url"
              value={formData.videoUrl}
              onChange={(e) => handleChange('videoUrl', e.target.value)}
              placeholder="https://example.com/video.mp4"
              disabled={isFormDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between">
            <div>
              {isDirty && (
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  Unsaved changes
                </span>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isFormDisabled}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isFormDisabled || !isDirty || isCodeValidating || !!codeError}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {mode === 'create' ? 'Create Movie' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
});

MovieEditForm.displayName = 'MovieEditForm';
