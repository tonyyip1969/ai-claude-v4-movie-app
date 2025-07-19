'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Movie } from '@/types/movie';
import MovieCard from '@/components/MovieCard';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import { MovieGridSkeleton, SearchSkeleton } from '@/components/LoadingSkeleton';
import { Film, Search as SearchIcon } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useMovieList } from '@/hooks/use-movie-queries';

function HomeContent() {
  const { settings, moviesPerPage, isLoaded } = useSettings();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchMode, setSearchMode] = useState(false);

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

  // Use enhanced query hooks for data fetching
  const {
    data: movieData,
    isLoading: moviesLoading,
  } = useMovieList({
    page: currentPage,
    limit: moviesPerPage,
  });

  // Get current data to display
  const movies = movieData?.movies || [];
  const totalPages = movieData?.totalPages || 1;
  const loading = moviesLoading;

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    window.history.pushState(null, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle search results
  const handleSearchResults = useCallback((results: Movie[]) => {
    setSearchResults(results);
    setSearchMode(true);
  }, []);

  // Handle search clear
  const handleSearchClear = useCallback(() => {
    setSearchResults([]);
    setSearchMode(false);
  }, []);

  // Note: Action handlers are not needed when using enhanced actions
  // The MovieCard will handle actions through the useEnhancedMovieActions hook

  const displayMovies = searchMode ? searchResults : movies;
  const showPagination = !searchMode && !loading;

  if (!isLoaded) {
    return <MovieGridSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header Section - Conditionally rendered */}
      {settings.showHeader && (
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl">
              <Film className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white">
              Discover Amazing{' '}
              <span className="text-gradient">Movies</span>
            </h1>
          </div>
          
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Explore our vast collection of movies with stunning visuals and immersive experiences. 
            Find your next favorite film in our carefully curated selection.
          </p>
        </div>
      )}

      {/* Search Bar - Always visible */}
      <div className="max-w-2xl mx-auto">
        <SearchBar
          onResults={handleSearchResults}
          onClear={handleSearchClear}
          placeholder="Search for movie code, title, or description..."
          className="w-full"
        />
      </div>

      {/* Content Section */}
      <div className="space-y-6">
        {/* Section Header */}
        {!loading && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SearchIcon className="w-6 h-6 text-primary-400" />
              <h2 className="text-2xl font-bold text-white">
                {searchMode ? 'Search Results' : 'Latest Movies'}
              </h2>
              {searchMode && (
                <span className="bg-primary-500/20 text-primary-300 px-3 py-1 rounded-full text-sm">
                  {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                </span>
              )}
            </div>
            
            {!searchMode && (
              <p className="text-gray-400 text-sm">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && !searchMode && <MovieGridSkeleton />}
        
        {/* Search Loading State */}
        {loading && searchMode && <SearchSkeleton />}

        {/* Movies Grid */}
        {!loading && displayMovies.length > 0 && (
          <div 
            className="grid gap-6"
            style={{
              gridTemplateColumns: `repeat(${settings.gridColumns}, 1fr)`
            }}
          >
            {displayMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                useEnhancedActions={true}
                currentPage={!searchMode ? currentPage : undefined}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && displayMovies.length === 0 && searchMode && (
          <div className="text-center py-16 space-y-4">
            <div className="w-20 h-20 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
              <SearchIcon className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300">No movies found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn&apos;t find any movies matching your search. Try different keywords or browse our collection.
            </p>
          </div>
        )}

        {/* No Movies at All */}
        {!loading && displayMovies.length === 0 && !searchMode && (
          <div className="text-center py-16 space-y-4">
            <div className="w-20 h-20 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
              <Film className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300">No movies available</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              There are no movies in the database yet. Please check back later.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<MovieGridSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
