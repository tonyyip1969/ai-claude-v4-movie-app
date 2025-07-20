'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Film, Save, X } from 'lucide-react';
import { Movie, MovieUpdatePayload } from '@/types/movie';
import { MovieEditForm } from '@/components/MovieEditForm';
import { MovieDetailSkeleton } from '@/components/LoadingSkeleton';
import { useEnhancedMovieActions } from '@/hooks/use-enhanced-movie-actions';

interface MovieEditPageProps {
  params: { id: string };
}

function MovieEditContent({ params }: MovieEditPageProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use enhanced movie actions for updating
  const { updateMovie, isMovieUpdating, updateMovieError } = useEnhancedMovieActions();

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/movies/${params.id}`);
        
        if (response.ok) {
          const movieData = await response.json();
          setMovie(movieData);
        } else if (response.status === 404) {
          setError('Movie not found');
        } else {
          setError('Failed to load movie');
        }
      } catch (error) {
        console.error('Error fetching movie:', error);
        setError('An error occurred while loading the movie');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [params.id]);

  const handleSave = async (updates: MovieUpdatePayload) => {
    if (!movie) return;

    try {
      updateMovie(movie.id, updates);
      
      // Show success message
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Optimistically update local movie state
      setMovie(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating movie:', error);
    }
  };

  const handleCancel = () => {
    // Navigate back to movie detail page with preserved URL parameters
    const returnPage = searchParams.get('page');
    const fromPage = searchParams.get('from');
    
    let targetUrl = `/movie/${params.id}`;
    const queryParams = new URLSearchParams();
    
    if (returnPage) queryParams.set('page', returnPage);
    if (fromPage) queryParams.set('from', fromPage);
    
    if (queryParams.toString()) {
      targetUrl += `?${queryParams.toString()}`;
    }
    
    router.push(targetUrl);
  };

  const handleBackToDetail = () => {
    handleCancel();
  };

  if (loading) {
    return (
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
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDetail}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit Movie
              </h1>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Film className="w-12 h-12 text-gray-400" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {error || 'Movie not found'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                {error === 'Movie not found' 
                  ? "The movie you're trying to edit doesn't exist or has been removed."
                  : "There was a problem loading this movie. Please try again later."
                }
              </p>
            </div>
            <button
              onClick={handleBackToDetail}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Movie</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side - Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDetail}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Back to movie details"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              {/* Breadcrumbs */}
              <nav className="flex items-center space-x-2 text-sm">
                <button
                  onClick={() => router.push('/')}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Movies
                </button>
                <span className="text-gray-400 dark:text-gray-500">/</span>
                <button
                  onClick={handleBackToDetail}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors truncate max-w-48"
                  title={movie.title}
                >
                  {movie.title}
                </button>
                <span className="text-gray-400 dark:text-gray-500">/</span>
                <span className="text-gray-900 dark:text-white font-medium">Edit</span>
              </nav>
            </div>

            {/* Right Side - Status */}
            <div className="flex items-center space-x-4">
              {saveSuccess && (
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <Save className="w-4 h-4" />
                  <span className="text-sm font-medium">Changes saved!</span>
                </div>
              )}
              
              {updateMovieError && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <X className="w-4 h-4" />
                  <span className="text-sm font-medium">Save failed</span>
                </div>
              )}
              
              {isMovieUpdating(movie.id) && (
                <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm font-medium">Saving...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MovieEditForm
          movie={movie}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isMovieUpdating(movie.id)}
          disabled={false}
        />
      </div>
    </div>
  );
}

export default function MovieEditPage({ params }: MovieEditPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MovieDetailSkeleton />
        </div>
      </div>
    }>
      <MovieEditContent params={params} />
    </Suspense>
  );
}
