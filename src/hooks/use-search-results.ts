import { useState, useCallback, useEffect } from 'react';
import { Movie } from '@/types/movie';
import { useEnhancedMovieActions } from './use-enhanced-movie-actions';

/**
 * Hook for managing search results with automatic mutation synchronization
 * 
 * This hook ensures that search results stay in sync with movie actions
 * (favorites, watchlist, rating) by providing action handlers that update
 * both the backend and local state immediately.
 */
export function useSearchResults() {
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searchMode, setSearchMode] = useState(false);
  
  const enhancedActions = useEnhancedMovieActions();

  // Handle search results update
  const handleSearchResults = useCallback((results: Movie[]) => {
    setSearchResults(results);
    setSearchMode(true);
  }, []);

  // Handle search clear
  const handleSearchClear = useCallback(() => {
    setSearchResults([]);
    setSearchMode(false);
  }, []);

  // Custom action handlers that immediately update search results
  const updateSearchResultMovie = useCallback((movieId: number, updates: Partial<Movie>) => {
    setSearchResults(prevResults => 
      prevResults.map(movie => 
        movie.id === movieId 
          ? { ...movie, ...updates }
          : movie
      )
    );
  }, []);

  const handleSearchResultFavoriteToggle = useCallback((movieId: number, currentStatus: boolean) => {
    // Immediately update the search results for instant feedback
    const newStatus = !currentStatus;
    updateSearchResultMovie(movieId, { isFavourite: newStatus });
    
    // Trigger the actual mutation
    enhancedActions.toggleFavorite(movieId, currentStatus);
    
    console.log('Search result favorite toggle:', { movieId, from: currentStatus, to: newStatus });
  }, [enhancedActions, updateSearchResultMovie]);

  const handleSearchResultWatchlistToggle = useCallback((movieId: number, currentStatus: boolean) => {
    // Immediately update the search results for instant feedback
    const newStatus = !currentStatus;
    updateSearchResultMovie(movieId, { isInWatchlist: newStatus });
    
    // Trigger the actual mutation
    enhancedActions.toggleWatchlist(movieId, currentStatus);
    
    console.log('Search result watchlist toggle:', { movieId, from: currentStatus, to: newStatus });
  }, [enhancedActions, updateSearchResultMovie]);

  const handleSearchResultRatingUpdate = useCallback((movieId: number, rating: number) => {
    // Immediately update the search results for instant feedback
    updateSearchResultMovie(movieId, { rating });
    
    // Trigger the actual mutation
    enhancedActions.updateRating(movieId, rating);
    
    console.log('Search result rating update:', { movieId, rating });
  }, [enhancedActions, updateSearchResultMovie]);

  // Sync with mutation failures (rollback on error)
  useEffect(() => {
    if (!searchMode) return;

    // Handle favorite mutation error - rollback
    if (enhancedActions.favoriteMutation.isError && 
        enhancedActions.favoriteMutation.variables) {
      
      const { movieId, currentStatus } = enhancedActions.favoriteMutation.variables;
      console.log('Favorite mutation failed, rolling back:', { movieId, rollbackTo: currentStatus });
      updateSearchResultMovie(movieId, { isFavourite: currentStatus });
    }

    // Handle watchlist mutation error - rollback
    if (enhancedActions.watchlistMutation.isError && 
        enhancedActions.watchlistMutation.variables) {
      
      const { movieId, currentStatus } = enhancedActions.watchlistMutation.variables;
      console.log('Watchlist mutation failed, rolling back:', { movieId, rollbackTo: currentStatus });
      updateSearchResultMovie(movieId, { isInWatchlist: currentStatus });
    }

    // Handle rating mutation error - rollback  
    if (enhancedActions.ratingMutation.isError && 
        enhancedActions.ratingMutation.variables) {
      
      const { movieId } = enhancedActions.ratingMutation.variables;
      // For rating, we need to get the original value - this is more complex
      // For now, we'll let the user retry
      console.log('Rating mutation failed:', { movieId });
    }
  }, [
    searchMode,
    enhancedActions.favoriteMutation.isError,
    enhancedActions.favoriteMutation.variables,
    enhancedActions.watchlistMutation.isError,
    enhancedActions.watchlistMutation.variables,
    enhancedActions.ratingMutation.isError,
    enhancedActions.ratingMutation.variables,
    updateSearchResultMovie,
  ]);

  return {
    searchResults,
    searchMode,
    handleSearchResults,
    handleSearchClear,
    // Expose custom action handlers for search results
    searchResultActions: {
      toggleFavorite: handleSearchResultFavoriteToggle,
      toggleWatchlist: handleSearchResultWatchlistToggle,
      updateRating: handleSearchResultRatingUpdate,
    },
  };
}
