'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MovieCard from '@/components/MovieCard';
import Pagination from '@/components/Pagination';
import ResponsiveMovieGrid from '@/components/ResponsiveMovieGrid';
import { MovieGridSkeleton } from '@/components/LoadingSkeleton';
import { Heart, HeartOff } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useFavoriteMovies } from '@/hooks/use-movie-queries';

function FavoritesContent() {
  const { settings, moviesPerPage, isLoaded } = useSettings();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  
  // Initialize page from URL parameter
  useEffect(() => {
    const pageFromUrl = searchParams.get('page');
    if (pageFromUrl) {
      const parsedPage = parseInt(pageFromUrl, 10);
      if (!isNaN(parsedPage) && parsedPage > 0) {
        setCurrentPage(parsedPage);
      }
    }
  }, [searchParams]);

  // Use enhanced query hook for favorites
  const {
    data: favoritesData,
    isLoading,
    error,
  } = useFavoriteMovies({
    page: currentPage,
    limit: moviesPerPage,
  });

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    window.history.pushState(null, '', url.toString());
  };

  if (!isLoaded) {
    return <MovieGridSkeleton />;
  }

  const movies = favoritesData?.movies || [];
  const totalPages = favoritesData?.totalPages || 1;
  const total = favoritesData?.total || 0;

  return (
    <div className="space-y-8">
      {/* Header Section - Conditionally rendered */}
      {settings.showHeader && (
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
              <Heart className="w-7 h-7 text-white fill-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white">
              Your&nbsp;
              <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                Favorites
              </span>
            </h1>
          </div>
          
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Your personally curated collection of favorite movies. All the films you&apos;ve marked as favorites are here for easy access.
          </p>
        </div>
      )}

      {/* Section Header */}
      {!isLoading && (total > 0) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Heart className="w-6 h-6 text-red-400 fill-red-400" />
            <h2 className="text-2xl font-bold text-white">Favorite Movies</h2>
            <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm">
              {total} {total === 1 ? 'movie' : 'movies'}
            </span>
          </div>
          
          {totalPages > 1 && (
            <p className="text-gray-400 text-sm">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && <MovieGridSkeleton />}

      {/* Movies Grid */}
      {!isLoading && movies.length > 0 && (
        <ResponsiveMovieGrid
          movies={movies}
          currentPage={currentPage}
          pageContext="favorites"
          useEnhancedActions={true}
        />
      )}

      {/* Empty State */}
      {!isLoading && movies.length === 0 && (
        <div className="text-center py-16">
          <HeartOff className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No favorite movies yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start exploring and add movies to your favorites to see them here
          </p>
          <a
            href="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300"
          >
            <Heart className="w-4 h-4" />
            <span>Discover Movies</span>
          </a>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-red-400 mb-2">
              Error Loading Favorites
            </h3>
            <p className="text-red-300 text-sm">
              {error.message}
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && movies.length > 0 && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Tips Section */}
      {!isLoading && movies.length > 0 && (
        <div className="bg-gradient-to-br from-red-900/20 to-pink-900/20 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Manage Your Favorites</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                You can remove movies from your favorites by clicking the heart icon on any movie card. 
                Your favorites are saved and will be here whenever you return.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <Suspense fallback={<MovieGridSkeleton />}>
      <FavoritesContent />
    </Suspense>
  );
}
