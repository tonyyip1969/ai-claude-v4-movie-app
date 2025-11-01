# Implementation Tasks

## 1. Type Definitions
- [x] 1.1 Add `SortOption` type to `src/types/movie.ts` with values: 'createdAt', 'publishedAt', 'title', 'rating'
- [x] 1.2 Add `SortOrder` type with values: 'asc', 'desc'
- [x] 1.3 Update `MovieListParams` interface in hooks to include optional `sortBy` parameter

## 2. Database Layer
- [x] 2.1 Update `getMovies()` method in `src/lib/database.ts` to accept optional `sortBy` parameter (default: 'publishedAt')
- [x] 2.2 Implement SQL ORDER BY logic based on sortBy parameter with proper null handling
- [x] 2.3 Update `getFavoriteMoviesPaginated()` to accept sortBy parameter
- [x] 2.4 Update `getWatchlistMoviesPaginated()` to accept sortBy parameter
- [x] 2.5 Add validation for sortBy values to prevent SQL injection

## 3. API Layer
- [x] 3.1 Update `/api/movies/route.ts` GET handler to accept and validate `sortBy` query parameter
- [x] 3.2 Update `/api/movies/favorites/route.ts` to accept and pass sortBy parameter
- [x] 3.3 Update `/api/movies/watchlist/route.ts` to accept and pass sortBy parameter
- [x] 3.4 Add input validation for sortBy parameter (whitelist approach)

## 4. Data Fetching Hooks
- [x] 4.1 Update `useMovieList` hook in `src/hooks/use-movie-queries.ts` to accept sortBy parameter
- [x] 4.2 Update `useFavoriteMovies` hook to accept sortBy parameter
- [x] 4.3 Update `useWatchlistMovies` hook to accept sortBy parameter
- [x] 4.4 Update query keys factory to include sortBy in cache keys

## 5. UI Components
- [x] 5.1 Create `SortControl` component with dropdown UI using Lucide icons (ArrowUpDown)
- [x] 5.2 Add sort control to HomePage header section next to "Add Movie" button
- [x] 5.3 Style sort dropdown to match existing dark theme design
- [x] 5.4 Add sort control to Favorites page
- [x] 5.5 Add sort control to Watchlist page

## 6. State Management
- [x] 6.1 Add sortBy state to HomePage component
- [x] 6.2 Persist sort selection in URL query parameters
- [x] 6.3 Initialize sort from URL on page load
- [x] 6.4 Reset pagination to page 1 when sort changes

## 7. Testing & Validation
- [ ] 7.1 Verify sorting works correctly for all four options
- [ ] 7.2 Test pagination maintains sort order across pages
- [ ] 7.3 Test URL persistence (browser back/forward, direct links)
- [ ] 7.4 Test edge cases (empty list, single item, null values)
- [ ] 7.5 Verify favorites and watchlist pages respect sort selection
- [ ] 7.6 Test SQL injection prevention with invalid sortBy values
- [ ] 7.7 Verify backward compatibility (no sortBy param defaults to publishedAt)

## 8. Documentation
- [x] 8.1 Update API documentation comments for affected endpoints
- [x] 8.2 Add JSDoc comments for new sort-related types and parameters
