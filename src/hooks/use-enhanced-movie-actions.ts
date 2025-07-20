import { 
  useToggleFavorite, 
  useToggleWatchlist, 
  useUpdateRating,
  useUpdateMovie
} from './use-movie-mutations';
import { MovieUpdatePayload } from '@/types/movie';

/**
 * Enhanced movie actions hook that integrates with TanStack Query
 * 
 * This hook provides a simplified interface for movie actions while
 * leveraging the optimistic updates and automatic cache invalidation
 * provided by the mutation hooks.
 */

export interface EnhancedMovieActionsResult {
  // Mutation objects with full TanStack Query features
  favoriteMutation: ReturnType<typeof useToggleFavorite>;
  watchlistMutation: ReturnType<typeof useToggleWatchlist>;
  ratingMutation: ReturnType<typeof useUpdateRating>;
  updateMovieMutation: ReturnType<typeof useUpdateMovie>;
  
  // Simplified action functions
  toggleFavorite: (movieId: number, currentStatus: boolean) => void;
  toggleWatchlist: (movieId: number, currentStatus: boolean) => void;
  updateRating: (movieId: number, rating: number) => void;
  updateMovie: (movieId: number, updates: MovieUpdatePayload) => void;
  
  // Loading states
  isFavoriteChanging: (movieId: number) => boolean;
  isWatchlistChanging: (movieId: number) => boolean;
  isRatingChanging: (movieId: number) => boolean;
  isMovieUpdating: (movieId: number) => boolean;
  
  // Error states
  favoriteError: Error | null;
  watchlistError: Error | null;
  ratingError: Error | null;
  updateMovieError: Error | null;
}

/**
 * Enhanced movie actions hook with TanStack Query integration
 * 
 * Benefits over the original hook:
 * - Automatic cache invalidation
 * - Optimistic updates with rollback on error
 * - Shared cache across components
 * - Better error handling and retry logic
 * - Loading states per mutation
 */
export function useEnhancedMovieActions(): EnhancedMovieActionsResult {
  const favoriteMutation = useToggleFavorite();
  const watchlistMutation = useToggleWatchlist();
  const ratingMutation = useUpdateRating();
  const updateMovieMutation = useUpdateMovie();

  // Simplified action functions
  const toggleFavorite = (movieId: number, currentStatus: boolean) => {
    favoriteMutation.mutate({ movieId, currentStatus });
  };

  const toggleWatchlist = (movieId: number, currentStatus: boolean) => {
    watchlistMutation.mutate({ movieId, currentStatus });
  };

  const updateRating = (movieId: number, rating: number) => {
    ratingMutation.mutate({ movieId, rating });
  };

  const updateMovie = (movieId: number, updates: MovieUpdatePayload) => {
    updateMovieMutation.mutate({ movieId, updates });
  };

  // Loading state checkers
  const isFavoriteChanging = (movieId: number) => {
    return favoriteMutation.isPending && 
           favoriteMutation.variables?.movieId === movieId;
  };

  const isWatchlistChanging = (movieId: number) => {
    return watchlistMutation.isPending && 
           watchlistMutation.variables?.movieId === movieId;
  };

  const isRatingChanging = (movieId: number) => {
    return ratingMutation.isPending && 
           ratingMutation.variables?.movieId === movieId;
  };

  const isMovieUpdating = (movieId: number) => {
    return updateMovieMutation.isPending && 
           updateMovieMutation.variables?.movieId === movieId;
  };

  return {
    // Full mutation objects for advanced usage
    favoriteMutation,
    watchlistMutation,
    ratingMutation,
    updateMovieMutation,
    
    // Simplified action functions
    toggleFavorite,
    toggleWatchlist,
    updateRating,
    updateMovie,
    
    // Loading states
    isFavoriteChanging,
    isWatchlistChanging,
    isRatingChanging,
    isMovieUpdating,
    
    // Error states
    favoriteError: favoriteMutation.error,
    watchlistError: watchlistMutation.error,
    ratingError: ratingMutation.error,
    updateMovieError: updateMovieMutation.error,
  };
}

/**
 * Migration helper: provides backward compatibility with the original useMovieActions hook
 * 
 * This allows existing components to use the new TanStack Query functionality
 * without changing their interface.
 */
export function useMovieActionsCompat(options: {
  onFavoriteUpdate?: (movieId: number, isFavourite: boolean) => void;
  onWatchlistUpdate?: (movieId: number, isInWatchlist: boolean) => void;
  onRatingUpdate?: (movieId: number, rating: number) => void;
  onError?: (error: unknown, action: 'favorite' | 'watchlist' | 'rating', movieId: number) => void;
} = {}) {
  const enhanced = useEnhancedMovieActions();
  
  const {
    onFavoriteUpdate,
    onWatchlistUpdate,
    onRatingUpdate,
    onError = () => {}
  } = options;

  // Enhanced toggle functions that call the original callbacks
  const toggleFavorite = async (movieId: number): Promise<boolean | null> => {
    try {
      // Get current status from cache or assume false
      const result = await new Promise<boolean>((resolve, reject) => {
        enhanced.favoriteMutation.mutate(
          { movieId, currentStatus: false }, // Will be corrected by optimistic update
          {
            onSuccess: (data) => {
              onFavoriteUpdate?.(movieId, data.isFavourite);
              resolve(data.isFavourite);
            },
            onError: (error) => {
              onError(error, 'favorite', movieId);
              reject(error);
            }
          }
        );
      });
      return result;
    } catch {
      return null;
    }
  };

  const toggleWatchlist = async (movieId: number): Promise<boolean | null> => {
    try {
      const result = await new Promise<boolean>((resolve, reject) => {
        enhanced.watchlistMutation.mutate(
          { movieId, currentStatus: false }, // Will be corrected by optimistic update
          {
            onSuccess: (data) => {
              onWatchlistUpdate?.(movieId, data.isInWatchlist);
              resolve(data.isInWatchlist);
            },
            onError: (error) => {
              onError(error, 'watchlist', movieId);
              reject(error);
            }
          }
        );
      });
      return result;
    } catch {
      return null;
    }
  };

  const updateRating = async (movieId: number, rating: number): Promise<number | null> => {
    try {
      const result = await new Promise<number>((resolve, reject) => {
        enhanced.ratingMutation.mutate(
          { movieId, rating },
          {
            onSuccess: (data) => {
              onRatingUpdate?.(movieId, data.rating);
              resolve(data.rating);
            },
            onError: (error) => {
              onError(error, 'rating', movieId);
              reject(error);
            }
          }
        );
      });
      return result;
    } catch {
      return null;
    }
  };

  return {
    // State (backward compatibility)
    favoriteChanging: {},
    watchlistChanging: {},
    ratingChanging: {},
    
    // Actions
    toggleFavorite,
    toggleWatchlist,
    updateRating,
    
    // Utility functions
    isFavoriteChanging: enhanced.isFavoriteChanging,
    isWatchlistChanging: enhanced.isWatchlistChanging,
    isRatingChanging: enhanced.isRatingChanging,
  };
}
