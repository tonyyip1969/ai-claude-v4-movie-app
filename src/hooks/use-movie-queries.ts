import { useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { Movie, MovieListParams } from '@/types/movie';

interface MovieListResponse {
  movies: Movie[];
  total: number;
  totalPages: number;
}

/**
 * Fetch movies from API with pagination and sorting support
 */
async function fetchMovieList({ 
  page = 1, 
  limit = 20, 
  search, 
  type = 'all',
  sortBy
}: MovieListParams): Promise<MovieListResponse> {
  let url = '/api/movies';
  
  // Determine the correct endpoint based on type
  switch (type) {
    case 'favorites':
      url = '/api/movies/favorites';
      break;
    case 'watchlist':
      url = '/api/movies/watchlist';
      break;
  }
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (search) {
    url = '/api/movies/search';
    params.append('q', search);
  }
  
  // Add sortBy parameter if provided
  if (sortBy) {
    params.append('sortBy', sortBy);
  }
  
  const response = await fetch(`${url}?${params}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch movies: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Hook for fetching paginated movie lists with smart caching and sorting
 */
export function useMovieList(params: MovieListParams = {}) {
  return useQuery({
    queryKey: queryKeys.movies.list(params as Record<string, unknown>),
    queryFn: () => fetchMovieList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes for movie lists
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
}

/**
 * Hook for infinite scroll movie lists
 */
export function useInfiniteMovieList(params: Omit<MovieListParams, 'page'> = {}) {
  const { limit = 20, search, type = 'all' } = params;
  
  return useInfiniteQuery({
    queryKey: queryKeys.movies.list({ limit, search, type, infinite: true } as Record<string, unknown>),
    queryFn: ({ pageParam = 1 }) =>
      fetchMovieList({ ...params, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return nextPage <= lastPage.totalPages ? nextPage : undefined;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    initialPageParam: 1,
  });
}

/**
 * Hook for fetching favorite movies with prefetching
 */
export function useFavoriteMovies(params: Omit<MovieListParams, 'type'> = {}) {
  return useMovieList({ ...params, type: 'favorites' });
}

/**
 * Hook for fetching watchlist movies with prefetching
 */
export function useWatchlistMovies(params: Omit<MovieListParams, 'type'> = {}) {
  return useMovieList({ ...params, type: 'watchlist' });
}

/**
 * Hook for searching movies with debouncing
 */
export function useMovieSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.movies.searchResults(query),
    queryFn: () => fetchMovieList({ search: query }),
    enabled: enabled && query.length > 2, // Only search if query is longer than 2 chars
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
}

/**
 * Hook for fetching individual movie details
 */
export function useMovieDetail(id: number, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.movies.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/movies/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch movie: ${response.status}`);
      }
      return response.json();
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes for individual movies
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });
}

/**
 * Hook for fetching random movie
 */
export function useRandomMovie() {
  return useQuery({
    queryKey: queryKeys.movies.random(),
    queryFn: async () => {
      const response = await fetch('/api/movies/random');
      if (!response.ok) {
        throw new Error(`Failed to fetch random movie: ${response.status}`);
      }
      return response.json();
    },
    staleTime: 0, // Always fetch fresh random movie
    gcTime: 0, // Don't cache random movies
  });
}

/**
 * Hook for prefetching related movie data
 * Useful for optimizing navigation between pages
 */
export function useMoviePrefetching() {
  const queryClient = useQueryClient();
  
  const prefetchMovieList = (params: MovieListParams = {}) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.movies.list(params as Record<string, unknown>),
      queryFn: () => fetchMovieList(params),
      staleTime: 5 * 60 * 1000,
    });
  };
  
  const prefetchMovieDetail = (id: number) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.movies.detail(id),
      queryFn: async () => {
        const response = await fetch(`/api/movies/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch movie: ${response.status}`);
        }
        return response.json();
      },
      staleTime: 10 * 60 * 1000,
    });
  };
  
  const prefetchFavorites = () => prefetchMovieList({ type: 'favorites' } as Record<string, unknown>);
  const prefetchWatchlist = () => prefetchMovieList({ type: 'watchlist' } as Record<string, unknown>);
  
  return {
    prefetchMovieList,
    prefetchMovieDetail,
    prefetchFavorites,
    prefetchWatchlist,
  };
}

/**
 * Hook for optimistic movie list updates
 * Useful for immediately updating lists when movies are added/removed
 */
export function useMovieListOptimization() {
  const queryClient = useQueryClient();
  
  const updateMovieInLists = (movieId: number, updates: Partial<Movie>) => {
    // Update all movie list queries
    queryClient.setQueriesData(
      { queryKey: queryKeys.movies.lists() },
      (oldData: MovieListResponse | undefined) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          movies: oldData.movies.map(movie =>
            movie.id === movieId ? { ...movie, ...updates } : movie
          ),
        };
      }
    );
  };
  
  const removeMovieFromLists = (movieId: number, listType?: 'favorites' | 'watchlist') => {
    // Remove from specific list type or all lists
    const targetKey = listType
      ? queryKeys.movies.list({ type: listType } as Record<string, unknown>)
      : queryKeys.movies.lists();
    
    queryClient.setQueriesData(
      { queryKey: targetKey },
      (oldData: MovieListResponse | undefined) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          movies: oldData.movies.filter(movie => movie.id !== movieId),
          total: oldData.total - 1,
        };
      }
    );
  };
  
  return {
    updateMovieInLists,
    removeMovieFromLists,
  };
}
