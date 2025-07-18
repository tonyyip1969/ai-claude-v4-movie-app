# Movie Actions Centralization - DRY Implementation

## Overview

This document describes the centralization of movie action logic (favorite, watchlist, and rating operations) using the DRY (Don't Repeat Yourself) principle. The solution provides a reusable custom hook that eliminates code duplication across the application.

## Problem Statement

Previously, the application had duplicate movie action logic scattered across multiple pages:
- Home page (`src/app/page.tsx`)
- Movie detail page (`src/app/movie/[id]/page.tsx`) 
- Favorites page (`src/app/favorites/page.tsx`)
- Watchlist page (`src/app/watchlist/page.tsx`)
- Random page (`src/app/random/page.tsx`)

Each page had its own implementation of:
- API calls for toggling favorites
- API calls for toggling watchlist status
- API calls for updating ratings
- Loading state management
- Error handling
- State updates after successful operations

## Solution

### Custom Hook: `useMovieActions`

Created a centralized custom hook (`src/hooks/useMovieActions.ts`) that provides:

1. **Unified API calls** - Single implementation for all movie actions
2. **Loading state management** - Centralized loading states for each action type
3. **Error handling** - Consistent error handling with customizable error callbacks
4. **State update callbacks** - Flexible callbacks for updating local state after successful operations
5. **Utility functions** - Helper functions to check loading states

### Key Features

#### 1. Action Methods
```typescript
- toggleFavorite(movieId: number): Promise<boolean | null>
- toggleWatchlist(movieId: number): Promise<boolean | null>  
- updateRating(movieId: number, rating: number): Promise<number | null>
```

#### 2. Loading State Utilities
```typescript
- isFavoriteChanging(movieId: number): boolean
- isWatchlistChanging(movieId: number): boolean
- isRatingChanging(movieId: number): boolean
```

#### 3. State Update Callbacks
```typescript
interface UseMovieActionsOptions {
  onFavoriteUpdate?: (movieId: number, isFavourite: boolean) => void;
  onWatchlistUpdate?: (movieId: number, isInWatchlist: boolean) => void;
  onRatingUpdate?: (movieId: number, rating: number) => void;
  onError?: (error: unknown, action: string, movieId: number) => void;
}
```

#### 4. Helper Function for State Updates
```typescript
createMovieStateUpdaters(
  setMovies: React.Dispatch<React.SetStateAction<Movie[]>>,
  options?: {
    removeOnUnfavorite?: boolean;
    removeOnWatchlistRemove?: boolean;
    updateSearchResults?: {
      setSearchResults: React.Dispatch<React.SetStateAction<Movie[]>>;
      searchMode: boolean;
    };
  }
)
```

## Implementation Examples

### Movie Detail Page
```typescript
// Before: ~50 lines of duplicate code
const movieActions = useMovieActions({
  onFavoriteUpdate: (movieId, isFavourite) => {
    setMovie(prev => prev ? { ...prev, isFavourite } : null);
  },
  onWatchlistUpdate: (movieId, isInWatchlist) => {
    setMovie(prev => prev ? { ...prev, isInWatchlist } : null);
  },
  onRatingUpdate: (movieId, rating) => {
    setMovie(prev => prev ? { ...prev, rating } : null);
  }
});

// Usage: ~3 lines per action
const handleFavoriteToggle = async () => {
  if (!movie) return;
  await movieActions.toggleFavorite(movie.id);
};
```

### Home Page (with Search Results)
```typescript
// Handles both regular movies and search results
const movieStateUpdaters = createMovieStateUpdaters(setMovies, {
  updateSearchResults: { setSearchResults, searchMode }
});
const movieActions = useMovieActions(movieStateUpdaters);

const handleFavoriteToggle = async (movieId: number) => {
  await movieActions.toggleFavorite(movieId);
};
```

### Favorites Page (Auto-removal)
```typescript
// Automatically removes movies when unfavorited
const movieStateUpdaters = createMovieStateUpdaters(setMovies, {
  removeOnUnfavorite: true
});
const movieActions = useMovieActions(movieStateUpdaters);
```

### Watchlist Page (Auto-removal)
```typescript
// Automatically removes movies when removed from watchlist
const movieStateUpdaters = createMovieStateUpdaters(setMovies, {
  removeOnWatchlistRemove: true
});
const movieActions = useMovieActions(movieStateUpdaters);
```

## Benefits

### 1. Code Reduction
- **Before**: ~200 lines of duplicate code across 5 files
- **After**: ~50 lines in centralized hook + ~10 lines per page

### 2. Consistency
- All pages now use identical API call logic
- Consistent error handling across the application
- Uniform loading state management

### 3. Maintainability
- Single point of change for API modifications
- Easier to add new movie actions
- Centralized error handling and logging

### 4. Type Safety
- Full TypeScript support with proper type definitions
- Compile-time validation of callback signatures
- IntelliSense support for all hook methods

### 5. Flexibility
- Customizable state update callbacks
- Optional error handling
- Configurable behavior for different page contexts

## Usage Guidelines

### Basic Usage
```typescript
import { useMovieActions } from '@/hooks/useMovieActions';

const movieActions = useMovieActions({
  onFavoriteUpdate: (movieId, isFavourite) => {
    // Update local state
  }
});

// Use in event handlers
await movieActions.toggleFavorite(movieId);
```

### With State Updaters Helper
```typescript
import { useMovieActions, createMovieStateUpdaters } from '@/hooks/useMovieActions';

const movieStateUpdaters = createMovieStateUpdaters(setMovies, {
  removeOnUnfavorite: true // For favorites page
});
const movieActions = useMovieActions(movieStateUpdaters);
```

### Loading States
```typescript
// Check if specific action is in progress
const isLoading = movieActions.isFavoriteChanging(movieId);

// Use in UI
<button disabled={isLoading}>
  {isLoading ? 'Updating...' : 'Add to Favorites'}
</button>
```

## Migration Summary

All pages have been successfully migrated to use the centralized `useMovieActions` hook:

1. ✅ Movie Detail Page (`src/app/movie/[id]/page.tsx`)
2. ✅ Home Page (`src/app/page.tsx`) 
3. ✅ Favorites Page (`src/app/favorites/page.tsx`)
4. ✅ Watchlist Page (`src/app/watchlist/page.tsx`)
5. ✅ Random Page (`src/app/random/page.tsx`)

## Future Enhancements

The centralized architecture makes it easy to add:
- Bulk operations (select multiple movies)
- Undo functionality
- Optimistic updates
- Offline support
- Analytics tracking
- Additional movie actions (bookmark, share, etc.)

This implementation demonstrates effective use of the DRY principle while maintaining flexibility and type safety throughout the application.
