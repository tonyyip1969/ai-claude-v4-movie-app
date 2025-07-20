import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidationPatterns } from '@/lib/query-keys';
import { Movie, MovieUpdatePayload } from '@/types/movie';

interface MovieCounts {
  total: number;
  favorites: number;
  watchlist: number;
}

interface MovieListResponse {
  movies: Movie[];
  total: number;
  totalPages: number;
}

/**
 * Movie action mutation hooks with automatic cache invalidation
 * 
 * These hooks handle movie state changes (favorites, watchlist, rating)
 * and automatically update the cache to maintain consistency across
 * the application without requiring manual refetches.
 */

interface ToggleFavoriteParams {
  movieId: number;
  currentStatus: boolean;
}

interface ToggleWatchlistParams {
  movieId: number;
  currentStatus: boolean;
}

interface UpdateRatingParams {
  movieId: number;
  rating: number;
}

interface UpdateMovieParams {
  movieId: number;
  updates: MovieUpdatePayload;
}

/**
 * Toggle favorite status for a movie
 */
async function toggleFavoriteAction(movieId: number): Promise<{ isFavourite: boolean }> {
  const response = await fetch(`/api/movies/${movieId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'toggleFavorite' }),
  });

  if (!response.ok) {
    throw new Error(`Failed to toggle favorite: ${response.status}`);
  }

  return response.json();
}

/**
 * Toggle watchlist status for a movie
 */
async function toggleWatchlistAction(movieId: number): Promise<{ isInWatchlist: boolean }> {
  const response = await fetch(`/api/movies/${movieId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'toggleWatchlist' }),
  });

  if (!response.ok) {
    throw new Error(`Failed to toggle watchlist: ${response.status}`);
  }

  return response.json();
}

/**
 * Update movie rating
 */
async function updateRatingAction(movieId: number, rating: number): Promise<{ rating: number }> {
  const response = await fetch(`/api/movies/${movieId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'updateRating', rating }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update rating: ${response.status}`);
  }

  return response.json();
}

/**
 * Update movie details
 */
async function updateMovieAction(movieId: number, updates: MovieUpdatePayload): Promise<Movie> {
  const response = await fetch(`/api/movies/${movieId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'updateMovie', updates }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update movie: ${response.status}`);
  }

  return response.json();
}

/**
 * Hook for toggling favorite status with optimistic updates
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ movieId }: ToggleFavoriteParams) => toggleFavoriteAction(movieId),
    
    // Optimistic update
    onMutate: async ({ movieId, currentStatus }: ToggleFavoriteParams) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: invalidationPatterns.movieCounts() });
      await queryClient.cancelQueries({ queryKey: invalidationPatterns.movieDetail(movieId) });
      await queryClient.cancelQueries({ queryKey: invalidationPatterns.movieLists() });

      // Snapshot previous values
      const previousCounts = queryClient.getQueryData(invalidationPatterns.movieCounts());
      const previousMovie = queryClient.getQueryData(invalidationPatterns.movieDetail(movieId));

      // Optimistically update counts
      queryClient.setQueryData(invalidationPatterns.movieCounts(), (old: MovieCounts | undefined) => {
        if (!old) return old;
        return {
          ...old,
          favorites: currentStatus ? old.favorites - 1 : old.favorites + 1,
        };
      });

      // Optimistically update movie detail
      queryClient.setQueryData(invalidationPatterns.movieDetail(movieId), (old: Movie | undefined) => {
        if (!old) return old;
        return { ...old, isFavourite: !currentStatus };
      });

      // Optimistically update all movie lists that might contain this movie
      queryClient.setQueriesData(
        { queryKey: invalidationPatterns.movieLists() },
        (old: MovieListResponse | undefined) => {
          if (!old?.movies) return old;
          return {
            ...old,
            movies: old.movies.map((movie: Movie) =>
              movie.id === movieId
                ? { ...movie, isFavourite: !currentStatus }
                : movie
            ),
          };
        }
      );

      return { previousCounts, previousMovie };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousCounts) {
        queryClient.setQueryData(invalidationPatterns.movieCounts(), context.previousCounts);
      }
      if (context?.previousMovie) {
        queryClient.setQueryData(invalidationPatterns.movieDetail(variables.movieId), context.previousMovie);
      }
    },

    // Always invalidate after mutation
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: invalidationPatterns.movieCounts() });
      queryClient.invalidateQueries({ queryKey: invalidationPatterns.favorites() });
      queryClient.invalidateQueries({ queryKey: invalidationPatterns.movieDetail(variables.movieId) });
      queryClient.invalidateQueries({ queryKey: invalidationPatterns.movieLists() });
    },
  });
}

/**
 * Hook for toggling watchlist status with optimistic updates
 */
export function useToggleWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ movieId }: ToggleWatchlistParams) => toggleWatchlistAction(movieId),
    
    // Optimistic update
    onMutate: async ({ movieId, currentStatus }: ToggleWatchlistParams) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: invalidationPatterns.movieCounts() });
      await queryClient.cancelQueries({ queryKey: invalidationPatterns.movieDetail(movieId) });
      await queryClient.cancelQueries({ queryKey: invalidationPatterns.movieLists() });

      // Snapshot previous values
      const previousCounts = queryClient.getQueryData(invalidationPatterns.movieCounts());
      const previousMovie = queryClient.getQueryData(invalidationPatterns.movieDetail(movieId));

      // Optimistically update counts
      queryClient.setQueryData(invalidationPatterns.movieCounts(), (old: MovieCounts | undefined) => {
        if (!old) return old;
        return {
          ...old,
          watchlist: currentStatus ? old.watchlist - 1 : old.watchlist + 1,
        };
      });

      // Optimistically update movie detail
      queryClient.setQueryData(invalidationPatterns.movieDetail(movieId), (old: Movie | undefined) => {
        if (!old) return old;
        return { ...old, isInWatchlist: !currentStatus };
      });

      // Optimistically update all movie lists that might contain this movie
      queryClient.setQueriesData(
        { queryKey: invalidationPatterns.movieLists() },
        (old: MovieListResponse | undefined) => {
          if (!old?.movies) return old;
          return {
            ...old,
            movies: old.movies.map((movie: Movie) =>
              movie.id === movieId
                ? { ...movie, isInWatchlist: !currentStatus }
                : movie
            ),
          };
        }
      );

      return { previousCounts, previousMovie };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousCounts) {
        queryClient.setQueryData(invalidationPatterns.movieCounts(), context.previousCounts);
      }
      if (context?.previousMovie) {
        queryClient.setQueryData(invalidationPatterns.movieDetail(variables.movieId), context.previousMovie);
      }
    },

    // Always invalidate after mutation
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: invalidationPatterns.movieCounts() });
      queryClient.invalidateQueries({ queryKey: invalidationPatterns.watchlist() });
      queryClient.invalidateQueries({ queryKey: invalidationPatterns.movieDetail(variables.movieId) });
      queryClient.invalidateQueries({ queryKey: invalidationPatterns.movieLists() });
    },
  });
}

/**
 * Hook for updating movie rating
 */
export function useUpdateRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ movieId, rating }: UpdateRatingParams) => updateRatingAction(movieId, rating),
    
    // Optimistic update
    onMutate: async ({ movieId, rating }: UpdateRatingParams) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: invalidationPatterns.movieDetail(movieId) });
      await queryClient.cancelQueries({ queryKey: invalidationPatterns.movieLists() });

      // Snapshot previous value
      const previousMovie = queryClient.getQueryData(invalidationPatterns.movieDetail(movieId));

      // Optimistically update movie detail
      queryClient.setQueryData(invalidationPatterns.movieDetail(movieId), (old: Movie | undefined) => {
        if (!old) return old;
        return { ...old, rating };
      });

      // Optimistically update all movie lists that might contain this movie
      queryClient.setQueriesData(
        { queryKey: invalidationPatterns.movieLists() },
        (old: MovieListResponse | undefined) => {
          if (!old?.movies) return old;
          return {
            ...old,
            movies: old.movies.map((movie: Movie) =>
              movie.id === movieId
                ? { ...movie, rating }
                : movie
            ),
          };
        }
      );

      return { previousMovie };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousMovie) {
        queryClient.setQueryData(invalidationPatterns.movieDetail(variables.movieId), context.previousMovie);
      }
    },

    // Always invalidate after mutation
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: invalidationPatterns.movieDetail(variables.movieId) });
      queryClient.invalidateQueries({ queryKey: invalidationPatterns.movieLists() });
    },
  });
}

/**
 * Hook for updating movie details with optimistic updates
 */
export function useUpdateMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ movieId, updates }: UpdateMovieParams) => updateMovieAction(movieId, updates),
    
    // Optimistic update
    onMutate: async ({ movieId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: invalidationPatterns.movieDetail(movieId) });
      await queryClient.cancelQueries({ queryKey: invalidationPatterns.movieLists() });

      // Snapshot previous value
      const previousMovie = queryClient.getQueryData(invalidationPatterns.movieDetail(movieId));

      // Optimistically update movie detail
      queryClient.setQueryData(invalidationPatterns.movieDetail(movieId), (old: Movie | undefined) => {
        if (!old) return old;
        return { ...old, ...updates };
      });

      // Optimistically update all movie lists that might contain this movie
      queryClient.setQueriesData(
        { queryKey: invalidationPatterns.movieLists() },
        (old: MovieListResponse | undefined) => {
          if (!old?.movies) return old;
          return {
            ...old,
            movies: old.movies.map((movie: Movie) =>
              movie.id === movieId
                ? { ...movie, ...updates }
                : movie
            ),
          };
        }
      );

      return { previousMovie };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousMovie) {
        queryClient.setQueryData(invalidationPatterns.movieDetail(variables.movieId), context.previousMovie);
      }
    },

    // Always invalidate after mutation
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: invalidationPatterns.movieDetail(variables.movieId) });
      queryClient.invalidateQueries({ queryKey: invalidationPatterns.movieLists() });
      queryClient.invalidateQueries({ queryKey: invalidationPatterns.movieCounts() });
    },
  });
}
