/**
 * Centralized query key factory for consistent cache management
 * 
 * This factory provides type-safe query keys for all movie-related queries,
 * enabling precise cache invalidation and query management.
 */

export const queryKeys = {
  // Root key for all movie-related queries
  movies: {
    all: ['movies'] as const,
    
    // Movie lists
    lists: () => [...queryKeys.movies.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.movies.lists(), filters] as const,
    
    // Individual movies
    details: () => [...queryKeys.movies.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.movies.details(), id] as const,
    
    // Movie counts
    counts: () => [...queryKeys.movies.all, 'counts'] as const,
    
    // Favorites
    favorites: () => [...queryKeys.movies.all, 'favorites'] as const,
    favoritesList: (filters: Record<string, unknown>) => [...queryKeys.movies.favorites(), 'list', filters] as const,
    
    // Watchlist
    watchlist: () => [...queryKeys.movies.all, 'watchlist'] as const,
    watchlistList: (filters: Record<string, unknown>) => [...queryKeys.movies.watchlist(), 'list', filters] as const,
    
    // Search
    search: () => [...queryKeys.movies.all, 'search'] as const,
    searchResults: (query: string) => [...queryKeys.movies.search(), query] as const,
    
    // Random movie
    random: () => [...queryKeys.movies.all, 'random'] as const,
  },
  
  // Settings queries
  settings: {
    all: ['settings'] as const,
    detail: (key: string) => [...queryKeys.settings.all, key] as const,
  },
} as const;

/**
 * Helper functions for query invalidation patterns
 */
export const invalidationPatterns = {
  // Invalidate all movie-related data
  allMovies: () => queryKeys.movies.all,
  
  // Invalidate counts when movie status changes
  movieCounts: () => queryKeys.movies.counts(),
  
  // Invalidate favorites when favorite status changes
  favorites: () => queryKeys.movies.favorites(),
  
  // Invalidate watchlist when watchlist status changes
  watchlist: () => queryKeys.movies.watchlist(),
  
  // Invalidate specific movie details
  movieDetail: (id: number) => queryKeys.movies.detail(id),
  
  // Invalidate movie lists (for pagination updates)
  movieLists: () => queryKeys.movies.lists(),
} as const;
