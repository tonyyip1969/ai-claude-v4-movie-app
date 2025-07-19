import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useMoviePrefetching } from './use-movie-queries';
import { useMovieCountsInvalidation } from './use-movie-counts';

/**
 * Route-based prefetching hook for optimizing navigation performance
 * 
 * This hook automatically prefetches data that's likely to be needed
 * based on the current route and user navigation patterns.
 */
export function useRoutePrefetching() {
  const pathname = usePathname();
  const { prefetchFavorites, prefetchWatchlist, prefetchMovieList } = useMoviePrefetching();
  const { prefetchCounts } = useMovieCountsInvalidation();

  useEffect(() => {
    // Always prefetch counts on route changes (lightweight operation)
    prefetchCounts();

    // Route-specific prefetching
    switch (pathname) {
      case '/':
        // On home page, prefetch first page of favorites and watchlist
        prefetchFavorites();
        prefetchWatchlist();
        break;
        
      case '/favorites':
        // On favorites page, prefetch watchlist
        prefetchWatchlist();
        break;
        
      case '/watchlist':
        // On watchlist page, prefetch favorites
        prefetchFavorites();
        break;
        
      case '/random':
        // On random page, prefetch main movie list
        prefetchMovieList({ page: 1, limit: 20 });
        break;
        
      default:
        // For movie detail pages, prefetch main list
        if (pathname.startsWith('/movie/')) {
          prefetchMovieList({ page: 1, limit: 20 });
        }
        break;
    }
  }, [pathname, prefetchFavorites, prefetchWatchlist, prefetchMovieList, prefetchCounts]);
}

/**
 * Hook for smart background refetching based on user activity
 * 
 * This hook implements intelligent background sync strategies
 * to keep data fresh without overwhelming the server.
 */
export function useSmartBackgroundSync() {
  const { invalidateCounts } = useMovieCountsInvalidation();

  useEffect(() => {
    let isVisible = true;
    let lastActivity = Date.now();
    
    // Track page visibility
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        const timeSinceLastActivity = Date.now() - lastActivity;
        // If page was hidden for more than 5 minutes, refresh counts
        if (timeSinceLastActivity > 5 * 60 * 1000) {
          invalidateCounts();
        }
        lastActivity = Date.now();
      }
    };

    // Track user activity
    const handleActivity = () => {
      lastActivity = Date.now();
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('scroll', handleActivity);
    document.addEventListener('click', handleActivity);

    // Background sync interval (only when page is visible and user is active)
    const syncInterval = setInterval(() => {
      if (isVisible) {
        const timeSinceLastActivity = Date.now() - lastActivity;
        // Only sync if user was active in the last 10 minutes
        if (timeSinceLastActivity < 10 * 60 * 1000) {
          invalidateCounts();
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('scroll', handleActivity);
      document.removeEventListener('click', handleActivity);
      clearInterval(syncInterval);
    };
  }, [invalidateCounts]);
}

/**
 * Hook for query warming on application startup
 * 
 * This hook prefetches critical data when the application starts
 * to provide a better initial user experience.
 */
export function useQueryWarming() {
  const { prefetchMovieList, prefetchFavorites } = useMoviePrefetching();
  const { prefetchCounts } = useMovieCountsInvalidation();

  useEffect(() => {
    // Warm up critical queries on app startup
    const warmupQueries = async () => {
      try {
        // Start with counts (most important for sidebar)
        await prefetchCounts();
        
        // Then main movie list (first page)
        await prefetchMovieList({ page: 1, limit: 20 });
        
        // Finally favorites (if user has any)
        await prefetchFavorites();
      } catch (error) {
        console.warn('Query warming failed:', error);
      }
    };

    // Delay warming to not interfere with initial page load
    const timer = setTimeout(warmupQueries, 1000);
    
    return () => clearTimeout(timer);
  }, [prefetchCounts, prefetchMovieList, prefetchFavorites]);
}

/**
 * Main hook that combines all prefetching strategies
 * 
 * This should be used in the main layout component to enable
 * all performance optimizations.
 */
export function useQueryOptimization() {
  useRoutePrefetching();
  useSmartBackgroundSync();
  useQueryWarming();
}
