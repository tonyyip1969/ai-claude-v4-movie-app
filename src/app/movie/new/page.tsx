'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, X } from 'lucide-react';
import { MovieCreatePayload } from '@/types/movie';
import { MovieEditForm, MovieEditFormRef } from '@/components/MovieEditForm';
import { MovieDetailSkeleton } from '@/components/LoadingSkeleton';
import { useEnhancedMovieActions } from '@/hooks/use-enhanced-movie-actions';

function MovieCreateContent() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const formRef = useRef<MovieEditFormRef>(null);

  // Use enhanced movie actions for creating
  const { isMovieCreating, createMovieError, createMovieMutation } = useEnhancedMovieActions();

  // Clear previous errors when starting a new creation
  const clearErrorState = () => {
    if (createMovieError && createMovieMutation) {
      createMovieMutation.reset();
    }
  };

  const handleCreate = async (movieData: MovieCreatePayload) => {
    try {
      // Clear any previous error state before attempting creation
      clearErrorState();
      
      // Use the mutation directly with callbacks for better control
      createMovieMutation.mutate(
        { movieData },
        {
          onSuccess: () => {
            // Clear any lingering error state
            clearErrorState();
            
            // Show success message
            setSuccessMessage('Movie created successfully! You can create another movie.');
            
            // Auto-dismiss success message after 5 seconds
            setTimeout(() => setSuccessMessage(null), 5000);
            
            // Reset form using ref
            formRef.current?.resetForm();
          },
          onError: (error) => {
            console.error('Error creating movie:', error);
          }
        }
      );
    } catch (error) {
      console.error('Error creating movie:', error);
    }
  };

  const handleCancel = () => {
    // Navigate back to home page
    router.push('/');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side - Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToHome}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Back to home"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              {/* Breadcrumbs */}
              <nav className="flex items-center space-x-2 text-sm">
                <button
                  onClick={handleBackToHome}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Movies
                </button>
                <span className="text-gray-400 dark:text-gray-500">/</span>
                <span className="text-gray-900 dark:text-white font-medium">Create</span>
              </nav>
            </div>

            {/* Right Side - Status */}
            <div className="flex items-center space-x-4">
              {successMessage && (
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-md">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{successMessage}</span>
                </div>
              )}
              
              {createMovieError && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">
                  <span className="text-sm font-medium">
                    {createMovieError.message || 'Failed to create movie'}
                  </span>
                  <button
                    onClick={clearErrorState}
                    className="ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-800/30 rounded"
                    title="Dismiss error"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {isMovieCreating() && (
                <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm font-medium">Creating...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form Section */}
        <MovieEditForm
          ref={formRef}
          onCreate={handleCreate}
          onCancel={handleCancel}
          isLoading={isMovieCreating()}
          disabled={false}
          mode="create"
        />
      </div>
    </div>
  );
}

export default function MovieCreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MovieDetailSkeleton />
        </div>
      </div>
    }>
      <MovieCreateContent />
    </Suspense>
  );
}
