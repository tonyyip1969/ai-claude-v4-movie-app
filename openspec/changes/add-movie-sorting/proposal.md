# Add Movie Sorting Controls

## Why
Users currently cannot control how movies are sorted on the HomePage, which is fixed to sort by `publishedAt` DESC. Users need the ability to sort movies by different criteria (creation date, publication date, title, rating) to better discover and organize their movie collection based on their preferences.

## What Changes
- Add sort dropdown control to HomePage UI with four sorting options:
  - Recently Added (`createdAt` DESC) - Shows newest imports/additions first
  - Publication Date (`publishedAt` DESC) - Current default behavior
  - Title (A-Z) - Alphabetical ascending
  - Rating (High to Low) - Highest rated first
- Update `getMovies()` database method to accept optional `sortBy` parameter
- Update `/api/movies` endpoint to accept `sortBy` query parameter
- Persist user's sort preference in URL query parameters
- Update `useMovieList` hook to support sort parameter
- Maintain existing pagination functionality with new sorting
- Apply consistent sorting logic across all movie list views (home, favorites, watchlist)

## Impact
- **Affected specs**: `movie-browsing` (new capability to be created)
- **Affected code**: 
  - `src/lib/database.ts` - Add sortBy parameter to getMovies methods
  - `src/app/api/movies/route.ts` - Accept and validate sortBy param
  - `src/app/api/movies/favorites/route.ts` - Apply sorting to favorites
  - `src/app/api/movies/watchlist/route.ts` - Apply sorting to watchlist
  - `src/hooks/use-movie-queries.ts` - Add sortBy to query parameters
  - `src/app/page.tsx` - Add sort dropdown UI component
  - `src/types/movie.ts` - Add SortOption type definition
- **Breaking changes**: None - this is additive functionality with backward compatibility (defaults to current behavior)
- **Database changes**: None - uses existing columns
- **Performance impact**: Minimal - sorting is done at database level with indexed columns
