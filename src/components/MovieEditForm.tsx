import React, { useState, useEffect } from 'react';
import { Movie, MovieUpdatePayload } from '@/types/movie';

interface MovieEditFormProps {
  movie: Movie;
  onSave: (updates: MovieUpdatePayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * Simple Movie Edit Form Component
 * Basic form with minimal complexity
 */
export function MovieEditForm({
  movie,
  onSave,
  onCancel,
  isLoading = false,
  disabled = false,
}: MovieEditFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    publishedAt: '',
    coverUrl: '',
    videoUrl: '',
  });

  const [isDirty, setIsDirty] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Initialize form data
  useEffect(() => {
    const initialData = {
      title: movie.title || '',
      description: movie.description || '',
      code: movie.code || '',
      publishedAt: movie.publishedAt || '',
      coverUrl: movie.coverUrl || '',
      videoUrl: movie.videoUrl || '',
    };
    setFormData(initialData);
    setIsDirty(false);
  }, [movie]);

  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Check if form is dirty
      const originalData = {
        title: movie.title || '',
        description: movie.description || '',
        code: movie.code || '',
        publishedAt: movie.publishedAt || '',
        coverUrl: movie.coverUrl || '',
        videoUrl: movie.videoUrl || '',
      };
      
      const dirty = Object.keys(newData).some(key => 
        newData[key as keyof typeof newData] !== originalData[key as keyof typeof originalData]
      );
      
      setIsDirty(dirty);
      return newData;
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates: MovieUpdatePayload = {};
    
    if (formData.title !== (movie.title || '')) updates.title = formData.title;
    if (formData.description !== (movie.description || '')) updates.description = formData.description;
    if (formData.code !== (movie.code || '')) updates.code = formData.code;
    if (formData.publishedAt !== (movie.publishedAt || '')) updates.publishedAt = formData.publishedAt;
    if (formData.coverUrl !== (movie.coverUrl || '')) updates.coverUrl = formData.coverUrl;
    if (formData.videoUrl !== (movie.videoUrl || '')) updates.videoUrl = formData.videoUrl;

    onSave(updates);
  };

  const isFormDisabled = disabled || isLoading;

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Edit Movie Details
          </h2>
          
          {/* Movie Code - Moved to top */}
          <div className="mb-4">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Movie Code <span className="text-red-500">*</span>
            </label>
            <input
              id="code"
              type="text"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value)}
              placeholder="unique-movie-code"
              disabled={isFormDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Unique identifier for the movie (3-20 characters, letters, numbers, hyphens, underscores)
            </p>
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

          {/* Published Date */}
          <div className="mb-4">
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
                        <img
                          src={formData.coverUrl}
                          alt="Cover preview"
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
                disabled={isFormDisabled || !isDirty}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
