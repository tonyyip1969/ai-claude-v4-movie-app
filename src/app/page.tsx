'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import SortControl from '@/components/SortControl';
import TagFilterControl from '@/components/TagFilterControl';
import Pagination from '@/components/Pagination';
import ResponsiveMovieGrid from '@/components/ResponsiveMovieGrid';
import { MovieGridSkeleton, SearchSkeleton } from '@/components/LoadingSkeleton';
import { Film, Search as SearchIcon, Plus } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useMovieList } from '@/hooks/use-movie-queries';
import { useSearchResults } from '@/hooks/use-search-results';
import { SortOption } from '@/types/movie';

function HomeContent() {
  const { settings, moviesPerPage, isLoaded } = useSettings();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('publishedAt');
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);

  const handleCreateMovie = () => {
    router.push('/movie/new');
  };

  // Use the new search results hook that handles mutations automatically
  const {
    searchResults,
    searchMode,
    handleSearchResults,
    handleSearchClear,
    searchResultActions
  } = useSearchResults();

  // Initialize page and sort from URL parameters
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
      setSelectedTag(undefined);
    }
  }, [searchParams]);

  // Use enhanced query hooks for data fetching with sorting and filtering
  const {
    data: movieData,
    isLoading: moviesLoading,
  } = useMovieList({
    page: currentPage,
    limit: moviesPerPage,
    sortBy: sortBy,
    tag: selectedTag,
  });

  // Get current data to display
  const movies = movieData?.movies || [];
  const totalPages = movieData?.totalPages || 1;
  const loading = moviesLoading;

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updateUrl({ page: page.toString() });
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((newSortBy: SortOption) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to page 1 when sort changes
    updateUrl({ sortBy: newSortBy, page: '1' });
  }, []);

  // Handle tag selection
  const handleTagSelect = useCallback((tag: string | undefined) => {
    setSelectedTag(tag);
    setCurrentPage(1);
    updateUrl({ tag: tag || null, page: '1' });
  }, []);

  // Helper to update URL
  const updateUrl = (params: Record<string, string | null>) => {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    window.history.pushState(null, '', url.toString());
    if (params.page !== undefined) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <SearchIcon className="w-6 h-6 text-primary-400" />
              <h2 className="text-2xl font-bold text-white">
                {searchMode ? 'Search Results' : selectedTag ? `Movies tagged "${selectedTag}"` : 'Latest Movies'}
              </h2>
              {searchMode && (
                <span className="bg-primary-500/20 text-primary-300 px-3 py-1 rounded-full text-sm">
                  {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 flex-wrap">
              {/* Sort and Filter Controls - Only show when not in search mode */}
              {!searchMode && (
                <>
                  <TagFilterControl
                    selectedTag={selectedTag}
                    onTagSelect={handleTagSelect}
                  />
                  <SortControl
                    value={sortBy}
                    onChange={handleSortChange}
                  />
                </>
              )}

              <button
                onClick={handleCreateMovie}
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Movie</span>
              </button>

              {!searchMode && (
                <p className="text-gray-400 text-sm hidden md:block">
                  Page {currentPage} of {totalPages}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !searchMode && <MovieGridSkeleton />}

        {/* Search Loading State */}
        {loading && searchMode && <SearchSkeleton />}

        {/* Movies Grid */}
        {!loading && displayMovies.length > 0 && (
          <ResponsiveMovieGrid
            movies={displayMovies}
            currentPage={!searchMode ? currentPage : undefined}
            pageContext="home"
            useEnhancedActions={true}
            searchResultActions={searchMode ? {
              onFavoriteToggle: (id: number) => {
                const movie = displayMovies.find(m => m.id === id);
                if (movie) {
                  searchResultActions.toggleFavorite(id, movie.isFavourite);
                }
              },
              onWatchlistToggle: (id: number) => {
                const movie = displayMovies.find(m => m.id === id);
                if (movie) {
                  searchResultActions.toggleWatchlist(id, movie.isInWatchlist);
                }
              },
              onRatingUpdate: (id: number, rating: number) => {
                searchResultActions.updateRating(id, rating);
              },
            } : undefined}
          />
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
              {selectedTag
                ? `No movies found with tag "${selectedTag}".`
                : 'There are no movies in the database yet. Please check back later.'}
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
