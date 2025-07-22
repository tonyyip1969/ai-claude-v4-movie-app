"use client";

import { Movie } from "@/types/movie";
import MovieCard from "./MovieCard";
import { useSettings } from "@/hooks/useSettings";

interface ResponsiveMovieGridProps {
  /** Array of movies to display */
  movies: Movie[];
  /** Current page number for pagination context */
  currentPage?: number;
  /** Page context for movie card behavior */
  pageContext?: "home" | "favorites" | "watchlist";
  /** Additional CSS classes */
  className?: string;
  /** Gap size between cards */
  gap?: "small" | "medium" | "large";
  /** Whether to use enhanced TanStack Query actions */
  useEnhancedActions?: boolean;
  /** Search result specific actions for immediate state updates */
  searchResultActions?: {
    onFavoriteToggle?: (id: number) => void;
    onWatchlistToggle?: (id: number) => void;
    onRatingUpdate?: (id: number, rating: number) => void;
  };
}

/**
 * Centralized responsive movie grid component
 *
 * Breakpoint Strategy:
 * - Mobile (< 640px): 1 column
 * - Tablet (640px - 767px): 2 columns
 * - Desktop (768px+): User's gridColumns setting
 *
 * @example
 * ```tsx
 * <ResponsiveMovieGrid
 *   movies={displayMovies}
 *   currentPage={currentPage}
 *   pageContext="home"
 *   useEnhancedActions={true}
 * />
 * ```
 */
export default function ResponsiveMovieGrid({
  movies,
  currentPage,
  pageContext = "home",
  className = "",
  gap = "medium",
  useEnhancedActions = true,
  searchResultActions,
}: ResponsiveMovieGridProps) {
  const { settings } = useSettings();

  // Define gap sizes
  const gapClasses = {
    small: "gap-3 sm:gap-4",
    medium: "gap-4 sm:gap-6",
    large: "gap-6 sm:gap-8",
  };

  const selectedGap = gapClasses[gap];

  // Base grid classes with transitions
  const baseGridClasses = `grid transition-all duration-300 ${selectedGap} ${className}`;

  return (
    <>
      {/* Mobile Grid - 1 column */}
      <div className={`${baseGridClasses} grid-cols-1 sm:hidden`}>
        {movies.map((movie) => (
          <MovieCard
            key={`mobile-${movie.id}`}
            movie={movie}
            currentPage={currentPage}
            pageContext={pageContext}
            useEnhancedActions={useEnhancedActions}
            onFavoriteToggle={searchResultActions?.onFavoriteToggle}
            onWatchlistToggle={searchResultActions?.onWatchlistToggle}
            onRatingUpdate={searchResultActions?.onRatingUpdate}
          />
        ))}
      </div>

      {/* Tablet Grid - 2 columns */}
      <div
        className={`${baseGridClasses} hidden sm:grid md:hidden grid-cols-2`}
      >
        {movies.map((movie) => (
          <MovieCard
            key={`tablet-${movie.id}`}
            movie={movie}
            currentPage={currentPage}
            pageContext={pageContext}
            useEnhancedActions={useEnhancedActions}
            onFavoriteToggle={searchResultActions?.onFavoriteToggle}
            onWatchlistToggle={searchResultActions?.onWatchlistToggle}
            onRatingUpdate={searchResultActions?.onRatingUpdate}
          />
        ))}
      </div>

      {/* Large Tablet Grid - 3 columns */}
      <div
        className={`${baseGridClasses} hidden md:grid lg:hidden grid-cols-3`}
      >
        {movies.map((movie) => (
          <MovieCard
            key={`large-tablet-${movie.id}`}
            movie={movie}
            currentPage={currentPage}
            pageContext={pageContext}
            useEnhancedActions={useEnhancedActions}
            onFavoriteToggle={searchResultActions?.onFavoriteToggle}
            onWatchlistToggle={searchResultActions?.onWatchlistToggle}
            onRatingUpdate={searchResultActions?.onRatingUpdate}
          />
        ))}
      </div>

      {/* Large Desktop Grid - user setting columns */}
      {/* Desktop Grid - user setting columns */}
      <div
        className={`${baseGridClasses} hidden lg:grid`}
        style={{
          gridTemplateColumns: `repeat(${settings.gridColumns}, 1fr)`,
        }}
      >
        {movies.map((movie) => (
          <MovieCard
            key={`desktop-${movie.id}`}
            movie={movie}
            currentPage={currentPage}
            pageContext={pageContext}
            useEnhancedActions={useEnhancedActions}
            onFavoriteToggle={searchResultActions?.onFavoriteToggle}
            onWatchlistToggle={searchResultActions?.onWatchlistToggle}
            onRatingUpdate={searchResultActions?.onRatingUpdate}
          />
        ))}
      </div>
    </>
  );
}

/**
 * Hook for responsive grid utilities
 * Provides helper functions and data for responsive grid behavior
 */
export function useResponsiveGrid() {
  const { settings } = useSettings();

  /**
   * Get the effective number of columns for different breakpoints
   */
  const getEffectiveColumns = () => ({
    mobile: 1,
    tablet: 2,
    desktop: settings.gridColumns,
  });

  /**
   * Calculate total items that fit on current page for different breakpoints
   */
  const getItemsPerPage = (rows: number = settings.gridRows) => ({
    mobile: 1 * rows,
    tablet: 2 * rows,
    desktop: settings.gridColumns * rows,
  });

  return {
    getEffectiveColumns,
    getItemsPerPage,
    gridColumns: settings.gridColumns,
    gridRows: settings.gridRows,
  };
}
