# TanStack React Query Implementation Plan

## Problem Statement

The current Sidebar component fetches movie counts (favorites and watchlist) from the database every 5 seconds using `setInterval`, which:
- Creates excessive database load (12 requests/minute)
- Impacts database performance
- Refetches on every pathname change
- Has no caching mechanism
- Results in multiple independent fetch requests

**Current Performance:**
```
GET /api/movies/counts 200 in 55ms
GET /api/movies/counts 200 in 21ms
```

## Solution: TanStack React Query Migration

### Benefits
- **Reduced DB Load**: From 12 requests/minute to ~1-2 requests/minute
- **Better UX**: Instant updates with optimistic updates
- **Automatic Caching**: Shared cache across components
- **Smart Invalidation**: Only fetch when data actually changes
- **Offline Support**: Cached data available when offline
- **Error Handling**: Built-in retry logic and error boundaries

## Implementation Phases

### Phase 1: Install and Setup TanStack React Query ✅ COMPLETED

#### 1.1 Install Dependencies
```bash
npm install @tanstack/react-query
```

#### 1.2 Setup Query Client Provider
- Create `src/providers/query-provider.tsx` with optimized configuration
- Configure stale time (2 minutes), cache time (5 minutes), retry logic
- Add React Query DevTools for development

#### 1.3 Update Root Layout
- Wrap app with QueryClient provider in `src/app/layout.tsx`
- Maintain existing SidebarProvider structure

#### 1.4 Create Custom Hook
- Create `src/hooks/use-movie-counts.ts`
- Implement `useMovieCounts()` hook using `useQuery`
- Add proper TypeScript interfaces and error handling
- Include query key factory for manual invalidation

#### 1.5 Update Sidebar Component
- Replace `useEffect` polling with `useMovieCounts()` hook
- Remove 5-second interval completely
- Add loading states and error handling
- Maintain existing UI/UX behavior

**Query Configuration:**
```typescript
{
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  retry: 2
}
```

### Phase 2: Create Optimized Data Fetching (PLANNED)

#### 2.1 Enhanced Custom Hooks
- Extend `useMovieCounts()` with selective invalidation
- Add background refetching strategies
- Implement query prefetching for anticipated navigation

#### 2.2 Smart Invalidation Strategy
- Identify all actions that change movie counts
- Create invalidation triggers for specific operations
- Implement selective cache invalidation

#### 2.3 Cross-Component Optimization
- Ensure shared cache across all components using counts
- Implement query deduplication
- Add query persistence for offline scenarios

### Phase 3: Implement Mutation-Based Invalidation (PLANNED)

#### 3.1 Create Mutation Hooks
- `useAddToFavorites()` - Add movie to favorites
- `useRemoveFromFavorites()` - Remove movie from favorites
- `useAddToWatchlist()` - Add movie to watchlist
- `useRemoveFromWatchlist()` - Remove movie from watchlist

#### 3.2 Automatic Cache Invalidation
- Each mutation automatically invalidates relevant queries
- Use `onSuccess` callbacks to trigger cache updates
- Implement query key patterns for targeted invalidation

#### 3.3 Optimistic Updates
- Update UI immediately before API response
- Rollback changes if mutation fails
- Provide immediate user feedback

### Phase 4: Performance Optimizations (PLANNED)

#### 4.1 Background Sync Enhancements
- Fine-tune `refetchOnWindowFocus` behavior
- Implement `refetchOnReconnect` for network recovery
- Add visibility change detection for tab switching

#### 4.2 Selective Refetching
- Only refetch when specific pages are visited
- Use query enabled/disabled based on route
- Implement conditional query execution

#### 4.3 Advanced Caching Strategies
- Implement query warming for critical paths
- Add infinite query support for paginated data
- Create cache persistence strategies

## Technical Implementation Details

### File Structure
```
src/
├── providers/
│   └── query-provider.tsx          # QueryClient provider setup
├── hooks/
│   ├── use-movie-counts.ts         # Movie counts query hook
│   ├── use-movie-mutations.ts      # Movie action mutations (Phase 3)
│   └── use-movie-actions.ts        # Enhanced actions hook (Phase 3)
├── lib/
│   └── query-keys.ts              # Centralized query key factory
└── components/
    └── Sidebar.tsx                # Updated to use new hooks
```

### Query Key Strategy
```typescript
export const queryKeys = {
  movies: {
    all: ['movies'] as const,
    counts: () => [...queryKeys.movies.all, 'counts'] as const,
    favorites: () => [...queryKeys.movies.all, 'favorites'] as const,
    watchlist: () => [...queryKeys.movies.all, 'watchlist'] as const,
  },
} as const;
```

### Error Handling Strategy
- Retry logic for network failures
- Exponential backoff for server errors
- Graceful degradation for API unavailability
- User-friendly error messages
- Fallback to cached data when possible

## Performance Metrics (Expected)

### Before (Current Implementation)
- Database requests: 12/minute (every 5 seconds)
- Network calls: No deduplication
- Cache hits: 0%
- User experience: Delayed updates

### After (TanStack Query Implementation)
- Database requests: 1-2/minute (smart invalidation)
- Network calls: Automatic deduplication
- Cache hits: 85-90%
- User experience: Instant updates with optimistic UI

## Migration Checklist

### Phase 1 (Completed) ✅
- [x] Install @tanstack/react-query
- [x] Create QueryProvider with optimized config
- [x] Update root layout with provider
- [x] Create useMovieCounts hook
- [x] Update Sidebar component
- [x] Remove setInterval polling
- [x] Add loading states and error handling

### Phase 2 (Completed) ✅
- [x] Enhanced useMovieCounts hook with selective invalidation
- [x] Created centralized query key factory for consistent cache management
- [x] Implemented mutation hooks with optimistic updates and automatic invalidation
- [x] Added cross-component optimization with shared cache
- [x] Created comprehensive movie query hooks for all data fetching needs
- [x] Implemented route-based prefetching for better navigation performance
- [x] Added smart background sync with user activity tracking
- [x] Integrated query optimization into main layout

### Phase 3 (Completed) ✅
- [x] Enhanced MovieCard component to support both legacy callbacks and new TanStack Query actions
- [x] Added loading states and optimistic UI updates to MovieCard
- [x] Created enhanced pages for favorites and watchlist using new query hooks
- [x] Integrated mutation hooks with automatic cache invalidation
- [x] Added comprehensive error handling and loading states
- [x] Maintained backward compatibility while enabling enhanced features
- [x] Created enhanced page variants that can be easily swapped in

### Phase 4 (Enhancement)
- [ ] Advanced background sync
- [ ] Route-based query management
- [ ] Cache warming strategies
- [ ] Performance monitoring and analytics

## Risk Mitigation

### Potential Issues
1. **Breaking Changes**: Ensure backward compatibility during migration
2. **Cache Consistency**: Implement proper invalidation strategies
3. **Error Handling**: Maintain app functionality during API failures
4. **Memory Usage**: Monitor cache size and implement cleanup

### Mitigation Strategies
1. **Gradual Migration**: Phase-by-phase implementation
2. **Testing**: Comprehensive testing at each phase
3. **Monitoring**: Add performance monitoring and logging
4. **Rollback Plan**: Maintain ability to revert changes

## Success Criteria

### Performance Goals
- Reduce database load by 80%+ (from 12 to <3 requests/minute)
- Achieve 85%+ cache hit ratio
- Maintain or improve user experience
- Zero breaking changes to existing functionality

### Quality Goals
- Comprehensive error handling
- Proper TypeScript integration
- Clean, maintainable code
- Thorough documentation

## Conclusion

This implementation plan provides a structured approach to migrating from inefficient polling to an optimized caching and data fetching strategy using TanStack React Query. The phased approach ensures minimal risk while delivering significant performance improvements.

**Current Status: Phase 3 Complete ✅**
**Next Steps: Optional Phase 4 enhancements or production deployment**
