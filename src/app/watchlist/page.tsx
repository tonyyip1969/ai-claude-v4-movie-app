'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SortControl from '@/components/SortControl';
import TagFilterControl from '@/components/TagFilterControl';
import Pagination from '@/components/Pagination';
import ResponsiveMovieGrid from '@/components/ResponsiveMovieGrid';
import { MovieGridSkeleton } from '@/components/LoadingSkeleton';
import { Clock, X } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useWatchlistMovies } from '@/hooks/use-movie-queries';
import { SortOption } from '@/types/movie';

function WatchlistContent() {
  const { settings, moviesPerPage, isLoaded } = useSettings();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('publishedAt');
  const [selectedTag, setSelectedTag] = useState<string>('');

  // Initialize parameters from URL
  useEffect(() => {
    const pageFromUrl = searchParams.get('page');
    const sortFromUrl = searchParams.get('sortBy') as SortOption;
    const tagFromUrl = searchParams.get('tag');

    if (pageFromUrl) {
      const parsedPage = parseInt(pageFromUrl, 10);
      if (!isNaN(parsedPage) && parsedPage > 0) {
        setCurrentPage(parsedPage);
      }
    }

    if (sortFromUrl && ['createdAt', 'publishedAt', 'title', 'rating'].includes(sortFromUrl)) {
      setSortBy(sortFromUrl);
    }

    if (tagFromUrl) {
      setSelectedTag(tagFromUrl);
    } else {
      setSelectedTag('');
    }
  }, [searchParams]);

  // Use enhanced query hook for watchlist with sorting and filtering
  const {
    data: watchlistData,
    isLoading,
    error,
  } = useWatchlistMovies({
    page: currentPage,
    limit: moviesPerPage,
    sortBy: sortBy,
    tag: selectedTag || undefined,
  });

  // Helper to update URL
  const updateUrl = (updates: Record<string, string>) => {
    const url = new URL(window.location.href);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });
    window.history.pushState(null, '', url.toString());
  };

  // Handle page changes
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updateUrl({ page: page.toString() });
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((newSortBy: SortOption) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
    updateUrl({ sortBy: newSortBy, page: '1' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle tag change
  const handleTagChange = useCallback((tag: string | undefined) => {
    const newTag = tag || '';
    setSelectedTag(newTag);
    setCurrentPage(1);
    updateUrl({ tag: newTag, page: '1' });
  }, []);

  if (!isLoaded) {
    return <MovieGridSkeleton />;
  }

  const movies = watchlistData?.movies || [];
  const totalPages = watchlistData?.totalPages || 1;
  const total = watchlistData?.total || 0;

  return (
    <div className="space-y-8">
      {/* Header Section - Conditionally rendered */}
      {settings.showHeader && (
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white">
              {selectedTag ? (
                <>
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {selectedTag}
                  </span>
                  &nbsp;Watch List
                </>
              ) : (
                <>
                  Watch{' '}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    List
                  </span>
                </>
              )}
            </h1>
          </div>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Your personal collection of movies to watch later. Save interesting films here and never lose track of what you want to see next.
          </p>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Clock className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Watch List</h2>
          {!isLoading && (
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
              {total} {total === 1 ? 'movie' : 'movies'}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <TagFilterControl
            selectedTag={selectedTag}
            onTagSelect={handleTagChange}
          />
          <SortControl
            value={sortBy}
            onChange={handleSortChange}
          />
        </div>
      </div>

      {!isLoading && (total > 0) && totalPages > 1 && (
        <div className="flex justify-end">
          <p className="text-gray-400 text-sm hidden md:block">
            Page {currentPage} of {totalPages}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && <MovieGridSkeleton />}

      {/* Movies Grid */}
      {!isLoading && movies.length > 0 && (
        <ResponsiveMovieGrid
          movies={movies}
          currentPage={currentPage}
          pageContext="watchlist"
          useEnhancedActions={true}
        />
      )}

      {/* Empty State */}
      {!isLoading && movies.length === 0 && (
        <div className="text-center py-16">
          <div className="relative">
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <X className="w-6 h-6 text-gray-500 absolute -top-1 -right-1" />
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No watchlist movies found
          </h3>
          <p className="text-gray-500 mb-6">
            {selectedTag
              ? `No movies in your watchlist tagged with "${selectedTag}"`
              : "Add movies to your watchlist to keep track of what you want to watch"
            }
          </p>
          {selectedTag ? (
            <button
              onClick={() => handleTagChange('')}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Clear tag filter
            </button>
          ) : (
            <a
              href="/"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
            >
              <Clock className="w-4 h-4" />
              <span>Browse Movies</span>
            </a>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-red-400 mb-2">
              Error Loading Watchlist
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

      {/* Info Section */}
      {!isLoading && movies.length > 0 && (
        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">About Your Watchlist</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Movies in your watchlist are saved for easy access. You can remove them anytime by clicking the watchlist button again.
                This is perfect for keeping track of recommendations, upcoming releases, or movies you discover while browsing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WatchlistPage() {
  return (
    <Suspense fallback={<MovieGridSkeleton />}>
      <WatchlistContent />
    </Suspense>
  );
}
