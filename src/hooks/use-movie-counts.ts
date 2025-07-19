import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

interface MovieCounts {
  total: number;
  favorites: number;
  watchlist: number;
}

/**
 * Fetches movie counts from the API
 */
async function fetchMovieCounts(): Promise<MovieCounts> {
  const response = await fetch('/api/movies/counts');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch movie counts: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Custom hook for fetching and caching movie counts
 * 
 * Features:
 * - Automatic caching with 2-minute stale time
 * - Background refetching on window focus
 * - Error handling with retry logic
 * - Optimized for minimal database load
 * - Selective invalidation support
 * 
 * @returns Query result with movie counts data, loading state, and error state
 */
export function useMovieCounts() {
  return useQuery({
    queryKey: queryKeys.movies.counts(),
    queryFn: fetchMovieCounts,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof Error && error.message.includes('4')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook to get query client for manual cache operations
 * Useful for invalidating movie counts from other components
 */
export function useMovieCountsInvalidation() {
  const queryClient = useQueryClient();
  
  return {
    // Invalidate movie counts cache
    invalidateCounts: () => 
      queryClient.invalidateQueries({ queryKey: queryKeys.movies.counts() }),
    
    // Prefetch movie counts
    prefetchCounts: () =>
      queryClient.prefetchQuery({
        queryKey: queryKeys.movies.counts(),
        queryFn: fetchMovieCounts,
        staleTime: 2 * 60 * 1000,
      }),
    
    // Manually update counts cache (for optimistic updates)
    updateCounts: (updater: (old: MovieCounts | undefined) => MovieCounts) =>
      queryClient.setQueryData(queryKeys.movies.counts(), updater),
  };
}
