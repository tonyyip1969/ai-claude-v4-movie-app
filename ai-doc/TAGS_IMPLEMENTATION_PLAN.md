# Tags Feature Implementation Plan for Movie App

## Overview
This document outlines the comprehensive implementation plan for adding a Tags feature to the movie application. The Tags feature will allow movies to have multiple categorization labels (e.g., "Action", "Sci-Fi", "Thriller", "Award Winner", etc.) and provide filtering capabilities for users.

## Current System Analysis

### Existing Architecture
- **Frontend**: Next.js 14 with TypeScript, React 18, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: SQLite with better-sqlite3
- **State Management**: React hooks and context
- **UI Components**: Custom components with Lucide React icons

### Current Movie Data Structure
```typescript
interface Movie {
  id: number;
  code: string;
  title: string;
  description: string;
  videoUrl: string;
  coverUrl: string;
  isFavourite: boolean;
  isInWatchlist: boolean;
  rating: number;
  createdAt: string;
  publishedAt: string;
}
```

## Implementation Plan

### Phase 1: Database Schema Design and Migration

#### 1.1 Database Tables Design

**Tags Table**
```sql
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#6366f1', -- Default indigo color
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Movie-Tags Junction Table**
```sql
CREATE TABLE IF NOT EXISTS movie_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  movieId INTEGER NOT NULL,
  tagId INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (movieId) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(movieId, tagId)
);
```

#### 1.2 Database Migration Strategy
- **File**: `src/lib/database.ts`
- Add new tables in `initializeDatabase()` method
- Create migration function for existing data
- Add seed data for predefined tags

#### 1.3 Predefined Tags to Seed
```typescript
const defaultTags = [
  { name: 'Action', color: '#ef4444', description: 'High-energy, thrilling movies' },
  { name: 'Sci-Fi', color: '#8b5cf6', description: 'Science fiction and futuristic themes' },
  { name: 'Drama', color: '#f59e0b', description: 'Character-driven emotional stories' },
  { name: 'Comedy', color: '#10b981', description: 'Humorous and light-hearted content' },
  { name: 'Thriller', color: '#dc2626', description: 'Suspenseful and tension-filled' },
  { name: 'Fantasy', color: '#7c3aed', description: 'Magical and supernatural elements' },
  { name: 'Romance', color: '#ec4899', description: 'Love stories and relationships' },
  { name: 'Horror', color: '#1f2937', description: 'Scary and frightening content' },
  { name: 'Adventure', color: '#059669', description: 'Exciting journeys and quests' },
  { name: 'Mystery', color: '#4338ca', description: 'Puzzles and unknown elements' },
  { name: 'Documentary', color: '#6b7280', description: 'Non-fiction and educational' },
  { name: 'Animation', color: '#f97316', description: 'Animated movies and cartoons' },
  { name: 'Award Winner', color: '#facc15', description: 'Critically acclaimed films' },
  { name: 'New Release', color: '#06b6d4', description: 'Recently published movies' },
  { name: 'Classic', color: '#92400e', description: 'Timeless and iconic films' }
];
```

### Phase 2: Type Definitions and Data Models

#### 2.1 Update Type Definitions
**File**: `src/types/movie.ts`

```typescript
export interface Tag {
  id: number;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
}

export interface Movie {
  id: number;
  code: string;
  title: string;
  description: string;
  videoUrl: string;
  coverUrl: string;
  isFavourite: boolean;
  isInWatchlist: boolean;
  rating: number;
  createdAt: string;
  publishedAt: string;
  tags?: Tag[]; // New optional field for joined data
}

export interface TagWithCount {
  id: number;
  name: string;
  color: string;
  description?: string;
  movieCount: number;
}

export interface MovieFilters {
  search?: string;
  tags?: number[];
  favorites?: boolean;
  watchlist?: boolean;
  ratingMin?: number;
  ratingMax?: number;
}
```

#### 2.2 Database Query Methods
**File**: `src/lib/database.ts` - Add new methods to MovieDatabase class

```typescript
// Tag management methods
createTag(name: string, color: string, description?: string): Tag
getAllTags(): Tag[]
getTagsWithMovieCount(): TagWithCount[]
updateTag(id: number, updates: Partial<Tag>): boolean
deleteTag(id: number): boolean

// Movie-tag relationship methods
addTagToMovie(movieId: number, tagId: number): boolean
removeTagFromMovie(movieId: number, tagId: number): boolean
getMovieTags(movieId: number): Tag[]
getMoviesWithTags(filters?: MovieFilters): Movie[]
getMoviesByTag(tagId: number, page?: number, limit?: number): PaginatedMovies

// Enhanced search methods
searchMoviesWithFilters(filters: MovieFilters, page?: number, limit?: number): PaginatedMovies
```

### Phase 3: API Endpoints Implementation

#### 3.1 Tags Management API
**File**: `src/app/api/tags/route.ts`
- `GET /api/tags` - Get all tags with movie counts
- `POST /api/tags` - Create new tag (admin functionality)

**File**: `src/app/api/tags/[id]/route.ts`
- `GET /api/tags/[id]` - Get specific tag with movies
- `PATCH /api/tags/[id]` - Update tag
- `DELETE /api/tags/[id]` - Delete tag

#### 3.2 Movie-Tags Relationship API
**File**: `src/app/api/movies/[id]/tags/route.ts`
- `GET /api/movies/[id]/tags` - Get all tags for a movie
- `POST /api/movies/[id]/tags` - Add tag to movie
- `DELETE /api/movies/[id]/tags` - Remove tag from movie

#### 3.3 Enhanced Search API
**File**: `src/app/api/movies/search/route.ts` - Update existing
- Add support for tag filtering
- Support multiple filter combinations

**File**: `src/app/api/movies/filter/route.ts` - New endpoint
- `POST /api/movies/filter` - Advanced filtering with tags, ratings, etc.

### Phase 4: UI Components Development

#### 4.1 Tag Display Components

**File**: `src/components/Tag.tsx`
```typescript
interface TagProps {
  tag: Tag;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'ghost';
  showCount?: boolean;
  count?: number;
  onClick?: (tag: Tag) => void;
  onRemove?: (tag: Tag) => void;
  removable?: boolean;
}
```

**File**: `src/components/TagList.tsx`
```typescript
interface TagListProps {
  tags: Tag[];
  selectedTags?: number[];
  onTagToggle?: (tagId: number) => void;
  maxVisible?: number;
  showAll?: boolean;
}
```

#### 4.2 Tag Input Components

**File**: `src/components/TagSelector.tsx`
```typescript
interface TagSelectorProps {
  availableTags: Tag[];
  selectedTags: number[];
  onChange: (selectedTags: number[]) => void;
  placeholder?: string;
  maxTags?: number;
}
```

**File**: `src/components/TagInput.tsx`
```typescript
interface TagInputProps {
  movieId: number;
  currentTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  editable?: boolean;
}
```

#### 4.3 Filter Components

**File**: `src/components/AdvancedFilters.tsx`
```typescript
interface AdvancedFiltersProps {
  filters: MovieFilters;
  onFiltersChange: (filters: MovieFilters) => void;
  availableTags: Tag[];
  onReset: () => void;
}
```

### Phase 5: Page and Layout Updates

#### 5.1 Update MovieCard Component
**File**: `src/components/MovieCard.tsx`
- Add tags display section
- Show first 3-4 tags with overflow indicator
- Add hover effects for tag interactions

#### 5.2 Update Main Page
**File**: `src/app/page.tsx`
- Add advanced filtering sidebar/dropdown
- Integrate tag-based filtering
- Add tag cloud or popular tags section

#### 5.3 Create Tags Management Page
**File**: `src/app/tags/page.tsx`
- Display all tags with movie counts
- Tag creation/editing interface (admin)
- Tag statistics and usage analytics

#### 5.4 Movie Detail Page Updates
**File**: `src/app/movie/[id]/page.tsx`
- Add comprehensive tag display
- Tag editing functionality
- Related movies by similar tags

#### 5.5 New Tag-specific Pages
**File**: `src/app/tags/[id]/page.tsx`
- Show all movies for a specific tag
- Tag description and statistics
- Related tags suggestions

### Phase 6: Enhanced Search and Filtering

#### 6.1 Update SearchBar Component
**File**: `src/components/SearchBar.tsx`
- Add tag-based search suggestions
- Quick filter pills for popular tags
- Advanced search toggle

#### 6.2 Create Filter Context
**File**: `src/contexts/FilterContext.tsx`
```typescript
interface FilterContextType {
  filters: MovieFilters;
  updateFilters: (filters: Partial<MovieFilters>) => void;
  clearFilters: () => void;
  activeFiltersCount: number;
}
```

### Phase 7: User Experience Enhancements

#### 7.1 Tag Management Features
- Drag and drop tag reordering
- Tag color customization
- Tag merging functionality
- Bulk tag operations

#### 7.2 Smart Tag Suggestions
- Auto-suggest tags based on movie description
- Popular tag combinations
- Trending tags

#### 7.3 Tag Analytics
- Most used tags
- Tag usage trends
- Tag-based movie recommendations

### Phase 8: Mobile Responsiveness and Performance

#### 8.1 Mobile UI Adaptations
- Collapsible tag filters
- Swipeable tag selections
- Touch-friendly tag management

#### 8.2 Performance Optimizations
- Tag-based caching strategies
- Lazy loading for tag-heavy pages
- Database query optimizations with proper indexing

## Technical Considerations

### Database Indexing
```sql
-- Optimize tag-based queries
CREATE INDEX idx_movie_tags_movie_id ON movie_tags(movieId);
CREATE INDEX idx_movie_tags_tag_id ON movie_tags(tagId);
CREATE INDEX idx_tags_name ON tags(name);
```

### Caching Strategy
- Cache popular tag combinations
- Use React Query or SWR for tag data
- Implement server-side caching for frequently accessed tag queries

### Security Considerations
- Validate tag names (prevent XSS)
- Limit tag creation to authenticated users
- Sanitize tag inputs
- Rate limiting for tag operations

### Performance Monitoring
- Track tag query performance
- Monitor popular tag combinations
- Optimize database queries based on usage patterns

## Testing Strategy

### Unit Tests
- Tag creation and validation
- Database query methods
- Tag filtering logic

### Integration Tests
- API endpoint functionality
- Movie-tag relationship operations
- Search with tag filters

### UI Tests
- Tag component interactions
- Filter functionality
- Mobile responsiveness

## Future Enhancements

### Advanced Features
1. **Tag Hierarchies**: Parent-child tag relationships
2. **Smart Tags**: AI-generated tags based on movie content
3. **User-specific Tags**: Personal tagging system
4. **Tag-based Recommendations**: ML-driven suggestions
5. **Tag Analytics Dashboard**: Usage statistics and insights
6. **Export/Import Tags**: Backup and migration tools
7. **Tag Synonyms**: Alternative names for tags
8. **Tag Moderation**: Community-driven tag management

### Integration Possibilities
1. **External APIs**: Import tags from TMDB, IMDB
2. **Social Features**: Share tagged movie collections
3. **Admin Dashboard**: Comprehensive tag management
4. **API for Third-party**: Allow external tag management

## Success Metrics

### User Engagement
- Increased time spent browsing movies
- Higher movie discovery rates
- More user interactions with filtering

### System Performance
- Query response times under 200ms
- Successful tag operations (>99%)
- Mobile page load times under 3s

### Feature Adoption
- Percentage of movies with tags
- Active filter usage
- Tag-based search adoption

This comprehensive plan provides a roadmap for implementing a robust and user-friendly tags feature that will significantly enhance the movie discovery and organization capabilities of the application.
