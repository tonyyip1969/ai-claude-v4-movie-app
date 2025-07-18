'use client';

import { useState, useCallback } from 'react';
import { Movie } from '@/types/movie';

export interface MovieActionsState {
  favoriteChanging: Record<number, boolean>;
  watchlistChanging: Record<number, boolean>;
  ratingChanging: Record<number, boolean>;
}

export interface MovieActionsResult {
  // State
  favoriteChanging: Record<number, boolean>;
  watchlistChanging: Record<number, boolean>;
  ratingChanging: Record<number, boolean>;
  
  // Actions
  toggleFavorite: (movieId: number) => Promise<boolean | null>;
  toggleWatchlist: (movieId: number) => Promise<boolean | null>;
  updateRating: (movieId: number, rating: number) => Promise<number | null>;
  
  // Utility functions
  isFavoriteChanging: (movieId: number) => boolean;
  isWatchlistChanging: (movieId: number) => boolean;
  isRatingChanging: (movieId: number) => boolean;
}

export interface UseMovieActionsOptions {
  /**
   * Callback to update movie state after successful favorite toggle
   * @param movieId - The ID of the movie
   * @param isFavourite - The new favorite status
   */
  onFavoriteUpdate?: (movieId: number, isFavourite: boolean) => void;
  
  /**
   * Callback to update movie state after successful watchlist toggle
   * @param movieId - The ID of the movie
   * @param isInWatchlist - The new watchlist status
   */
  onWatchlistUpdate?: (movieId: number, isInWatchlist: boolean) => void;
  
  /**
   * Callback to update movie state after successful rating update
   * @param movieId - The ID of the movie
   * @param rating - The new rating
   */
  onRatingUpdate?: (movieId: number, rating: number) => void;
  
  /**
   * Custom error handler for failed actions
   * @param error - The error that occurred
   * @param action - The action that failed ('favorite', 'watchlist', 'rating')
   * @param movieId - The ID of the movie
   */
  onError?: (error: unknown, action: 'favorite' | 'watchlist' | 'rating', movieId: number) => void;
}

/**
 * Custom hook for centralized movie actions (favorite, watchlist, rating)
 * Implements the DRY principle by providing reusable movie action logic
 */
export function useMovieActions(options: UseMovieActionsOptions = {}): MovieActionsResult {
  const {
    onFavoriteUpdate,
    onWatchlistUpdate,
    onRatingUpdate,
    onError = (error, action, movieId) => {
      console.error(`Error ${action} movie ${movieId}:`, error);
    }
  } = options;

  // Loading states for different actions
  const [favoriteChanging, setFavoriteChanging] = useState<Record<number, boolean>>({});
  const [watchlistChanging, setWatchlistChanging] = useState<Record<number, boolean>>({});
  const [ratingChanging, setRatingChanging] = useState<Record<number, boolean>>({});

  /**
   * Generic function to make API calls for movie actions
   */
  const makeMovieActionRequest = useCallback(async (
    movieId: number,
    action: string,
    payload?: Record<string, unknown>
  ) => {
    const body = { action, ...payload };
    
    const response = await fetch(`/api/movies/${movieId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }, []);

  /**
   * Toggle favorite status for a movie
   */
  const toggleFavorite = useCallback(async (movieId: number): Promise<boolean | null> => {
    if (favoriteChanging[movieId]) return null;
    
    setFavoriteChanging(prev => ({ ...prev, [movieId]: true }));
    
    try {
      const result = await makeMovieActionRequest(movieId, 'toggleFavorite');
      const { isFavourite } = result;
      
      // Call the update callback if provided
      onFavoriteUpdate?.(movieId, isFavourite);
      
      return isFavourite;
    } catch (error) {
      onError(error, 'favorite', movieId);
      return null;
    } finally {
      setFavoriteChanging(prev => ({ ...prev, [movieId]: false }));
    }
  }, [favoriteChanging, makeMovieActionRequest, onFavoriteUpdate, onError]);

  /**
   * Toggle watchlist status for a movie
   */
  const toggleWatchlist = useCallback(async (movieId: number): Promise<boolean | null> => {
    if (watchlistChanging[movieId]) return null;
    
    setWatchlistChanging(prev => ({ ...prev, [movieId]: true }));
    
    try {
      const result = await makeMovieActionRequest(movieId, 'toggleWatchlist');
      const { isInWatchlist } = result;
      
      // Call the update callback if provided
      onWatchlistUpdate?.(movieId, isInWatchlist);
      
      return isInWatchlist;
    } catch (error) {
      onError(error, 'watchlist', movieId);
      return null;
    } finally {
      setWatchlistChanging(prev => ({ ...prev, [movieId]: false }));
    }
  }, [watchlistChanging, makeMovieActionRequest, onWatchlistUpdate, onError]);

  /**
   * Update rating for a movie
   */
  const updateRating = useCallback(async (movieId: number, rating: number): Promise<number | null> => {
    if (ratingChanging[movieId]) return null;
    
    setRatingChanging(prev => ({ ...prev, [movieId]: true }));
    
    try {
      const result = await makeMovieActionRequest(movieId, 'updateRating', { rating });
      const { rating: newRating } = result;
      
      // Call the update callback if provided
      onRatingUpdate?.(movieId, newRating);
      
      return newRating;
    } catch (error) {
      onError(error, 'rating', movieId);
      return null;
    } finally {
      setRatingChanging(prev => ({ ...prev, [movieId]: false }));
    }
  }, [ratingChanging, makeMovieActionRequest, onRatingUpdate, onError]);

  // Utility functions to check loading states
  const isFavoriteChanging = useCallback((movieId: number) => !!favoriteChanging[movieId], [favoriteChanging]);
  const isWatchlistChanging = useCallback((movieId: number) => !!watchlistChanging[movieId], [watchlistChanging]);
  const isRatingChanging = useCallback((movieId: number) => !!ratingChanging[movieId], [ratingChanging]);

  return {
    // State
    favoriteChanging,
    watchlistChanging,
    ratingChanging,
    
    // Actions
    toggleFavorite,
    toggleWatchlist,
    updateRating,
    
    // Utility functions
    isFavoriteChanging,
    isWatchlistChanging,
    isRatingChanging,
  };
}

/**
 * Higher-order function that creates movie state update handlers
 * for use with the useMovieActions hook
 */
export const createMovieStateUpdaters = (
  setMovies: React.Dispatch<React.SetStateAction<Movie[]>>,
  options: {
    /** Remove movie from list when unfavorited (useful for favorites page) */
    removeOnUnfavorite?: boolean;
    /** Remove movie from list when removed from watchlist (useful for watchlist page) */
    removeOnWatchlistRemove?: boolean;
    /** Update search results instead of main movies list */
    updateSearchResults?: {
      setSearchResults: React.Dispatch<React.SetStateAction<Movie[]>>;
      searchMode: boolean;
    };
  } = {}
) => {
  const {
    removeOnUnfavorite = false,
    removeOnWatchlistRemove = false,
    updateSearchResults
  } = options;

  const updateMovieList = (
    movieId: number,
    updates: Partial<Movie>,
    shouldRemove = false
  ) => {
    if (updateSearchResults?.searchMode) {
      updateSearchResults.setSearchResults(prev => 
        shouldRemove 
          ? prev.filter(movie => movie.id !== movieId)
          : prev.map(movie => 
              movie.id === movieId ? { ...movie, ...updates } : movie
            )
      );
    } else {
      setMovies(prev => 
        shouldRemove 
          ? prev.filter(movie => movie.id !== movieId)
          : prev.map(movie => 
              movie.id === movieId ? { ...movie, ...updates } : movie
            )
      );
    }
  };

  return {
    onFavoriteUpdate: (movieId: number, isFavourite: boolean) => {
      updateMovieList(
        movieId, 
        { isFavourite }, 
        removeOnUnfavorite && !isFavourite
      );
    },
    
    onWatchlistUpdate: (movieId: number, isInWatchlist: boolean) => {
      updateMovieList(
        movieId, 
        { isInWatchlist }, 
        removeOnWatchlistRemove && !isInWatchlist
      );
    },
    
    onRatingUpdate: (movieId: number, rating: number) => {
      updateMovieList(movieId, { rating });
    }
  };
};
