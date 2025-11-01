# Movie Sorting Design

## Context
The Movie Application currently displays movies in a fixed order (by `publishedAt` DESC). Users need flexible sorting to better discover and organize movies. This change adds user-controllable sorting while maintaining backward compatibility and performance.

**Stakeholders**: End users browsing movies, developers maintaining the codebase
**Constraints**: 
- Must not break existing API contracts
- Must maintain pagination functionality
- Must perform sorting at database level (not in-memory)
- Must work with existing SQLite database schema

## Goals / Non-Goals

### Goals
- Enable users to sort movies by creation date, publication date, title, and rating
- Maintain sort selection across pagination
- Persist sort preference in URL for sharing and bookmarking
- Apply consistent sorting across all movie list views
- Ensure backward compatibility (existing API calls continue to work)

### Non-Goals
- Multi-column sorting (e.g., sort by rating then title)
- Custom sort order persistence across sessions (localStorage)
- Sorting in search results (keep search relevance order)
- Server-side sort preference storage per user

## Decisions

### Decision 1: Sort Parameter Design
**Choice**: Use string-based `sortBy` query parameter with predefined values
**Why**: 
- Simple to implement and understand
- Easy to validate (whitelist approach)
- URL-friendly for sharing
- Aligns with REST conventions

**Alternatives considered**:
- Enum-based approach: More type-safe but adds complexity
- Separate sortField and sortOrder params: More flexible but overkill for this use case

### Decision 2: Default Sort Behavior
**Choice**: Default to `publishedAt DESC` (current behavior) when no sortBy provided
**Why**:
- Maintains backward compatibility
- Preserves existing user expectations
- No breaking changes to existing API consumers

### Decision 3: Sort Options
**Choice**: Four predefined sort options with sensible defaults
- `createdAt` → DESC (most recently added first)
- `publishedAt` → DESC (most recently published first)  
- `title` → ASC (A-Z alphabetical)
- `rating` → DESC (highest rated first)

**Why**:
- Covers primary use cases identified
- Each has a natural sort order (no need for separate order param)
- Simple user interface without complexity

**Alternatives considered**:
- Allowing both ASC/DESC for each field: More flexible but clutters UI
- Including more fields (description, code): Low value for sorting

### Decision 4: NULL Handling in SQL
**Choice**: Use `COALESCE` or `NULLS LAST` to handle null values consistently
- Rating nulls treated as 0 for sorting
- Date nulls sorted to end
- Title/code cannot be null (schema constraint)

**Why**:
- Predictable behavior for users
- Prevents SQL errors
- Maintains data integrity

### Decision 5: URL State Management
**Choice**: Use URL query parameters (`?sortBy=createdAt`) alongside existing page param
**Why**:
- Enables sharing sorted views
- Browser back/forward works naturally
- No additional state management needed
- Separates concerns (URL is source of truth)

### Decision 6: UI Component Placement
**Choice**: Add dropdown in header section next to "Add Movie" button
**Why**:
- High visibility without cluttering search area
- Groups with other action controls
- Consistent with existing UI patterns
- Works on mobile (responsive design)

## Technical Implementation

### Database Layer
```typescript
// Signature
getMovies(page: number, limit: number, sortBy?: SortOption): MovieListResponse

// SQL Generation
const orderByClause = {
  createdAt: 'ORDER BY createdAt DESC',
  publishedAt: 'ORDER BY publishedAt DESC', 
  title: 'ORDER BY LOWER(title) ASC',
  rating: 'ORDER BY COALESCE(rating, 0) DESC, title ASC'
}[sortBy || 'publishedAt'];
```

### API Layer
```typescript
// Route handler
const sortBy = searchParams.get('sortBy') as SortOption | null;
if (sortBy && !['createdAt', 'publishedAt', 'title', 'rating'].includes(sortBy)) {
  return NextResponse.json({ error: 'Invalid sortBy parameter' }, { status: 400 });
}
```

### Query Keys
```typescript
// TanStack Query cache keys
['movies', { page, limit, sortBy }]
['favorites', { page, limit, sortBy }]
['watchlist', { page, limit, sortBy }]
```

## Risks / Trade-offs

### Risk 1: Performance with Large Datasets
**Risk**: Sorting 10,000+ movies could slow down queries
**Mitigation**: 
- Database-level sorting (SQLite is optimized for this)
- Existing indexes on createdAt, publishedAt columns
- LIMIT/OFFSET keeps result sets small
- If needed: Add composite indexes for frequently used sorts

**Likelihood**: Low (SQLite handles 10k rows efficiently)
**Impact**: Medium (noticeable delay in query response)

### Risk 2: Query Cache Fragmentation
**Risk**: Multiple sort options create more cache entries
**Mitigation**:
- TanStack Query handles this automatically
- Cache size is manageable (4 sorts × ~50 pages max = 200 entries)
- Stale-while-revalidate keeps UX smooth

**Likelihood**: Low
**Impact**: Low (minor memory increase)

### Risk 3: UI Complexity on Mobile
**Risk**: Adding dropdown might clutter mobile header
**Mitigation**:
- Responsive design with proper breakpoints
- Icon-only button on small screens
- Bottom sheet or modal for sort selection on mobile (future enhancement)

**Likelihood**: Medium
**Impact**: Low (can be refined post-launch)

## Migration Plan

### Phase 1: Backend Implementation (Low Risk)
1. Add sortBy parameter to database methods (with defaults)
2. Update API routes to accept sortBy parameter
3. Add validation and error handling
4. Test with existing API calls (should work unchanged)

### Phase 2: Frontend Integration (Medium Risk)
1. Update hooks to accept sortBy parameter
2. Update query keys factory
3. Test data fetching with new parameters

### Phase 3: UI Addition (User-Facing)
1. Create SortControl component
2. Add to HomePage
3. Wire up state management and URL sync
4. Test user flows

### Rollback Strategy
- Change is additive with no breaking changes
- Remove UI component to revert user-facing changes
- Backend remains backward compatible
- No database migrations required

### Validation Criteria
- [ ] All existing API calls work without sortBy parameter
- [ ] New sortBy parameter produces correct ordering
- [ ] Invalid sortBy values return 400 error
- [ ] Pagination works correctly with all sort options
- [ ] URL state persists and initializes correctly

## Open Questions
1. ~~Should search results also be sortable?~~ → **Decision**: No, search results use relevance ordering
2. ~~Should we add ascending/descending toggle?~~ → **Decision**: No, each sort has sensible default direction
3. ~~Should sort preference persist across sessions?~~ → **Decision**: Phase 2 enhancement, not in initial scope
