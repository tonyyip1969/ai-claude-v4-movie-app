# Project Context

## Purpose
Movie Application v3.0 is a modern, Netflix-inspired web platform for browsing, organizing, and watching movies. The application provides an elegant dark-themed interface optimized for both desktop and mobile experiences, enabling users to discover, catalog, and enjoy their movie collections with features like favorites, watchlists, ratings, and CSV import functionality.

### Key Goals
- Provide an intuitive movie management platform with powerful organizational features
- Deliver a seamless, high-performance user experience across all devices
- Support multiple video formats (MP4 and HLS/M3U8)
- Enable bulk movie imports via CSV
- Maintain data locally with SQLite for simplicity and privacy

## Tech Stack

### Core Framework
- **Next.js 14.2.30** - App Router with React Server Components (RSC)
- **React 18** - UI library with modern hooks and concurrent features
- **TypeScript 5** - Strict type checking for enhanced code quality

### State Management & Data Fetching
- **TanStack Query v5** (React Query) - Server state management with caching, optimistic updates, and automatic refetching
- **React Context** - Global UI state (Settings, Sidebar)
- **React Hook Form** - Form state and validation
- **Zod v4** - Runtime schema validation and type inference

### Styling & UI
- **TailwindCSS 3.4** - Utility-first CSS framework with custom dark theme
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Modern icon library
- **clsx & tailwind-merge** - Conditional class name handling

### Database & Backend
- **better-sqlite3** - Fast, synchronous SQLite3 bindings for Node.js
- **Next.js API Routes** - RESTful API endpoints
- **Papa Parse** - Robust CSV parsing for bulk imports

### Media Handling
- **HLS.js** - HTTP Live Streaming (M3U8) video playback
- **Sharp** - High-performance image processing
- **Next.js Image** - Automatic image optimization with lazy loading

### Development Tools
- **ESLint** - Code quality and style enforcement
- **PostCSS** - CSS processing with TailwindCSS

## Project Conventions

### Code Style

#### File Naming
- **Directories**: lowercase-with-dashes (e.g., `components/auth-wizard`)
- **Components**: PascalCase (e.g., `MovieCard.tsx`, `VideoPlayer.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `use-movie-queries.ts`)
- **Utilities**: camelCase (e.g., `database.ts`, `query-keys.ts`)
- **Types**: camelCase (e.g., `movie.ts`, `import.ts`)

#### TypeScript Conventions
- **Strict mode enabled** - All TypeScript strict checks are on
- **No implicit any** - Explicit typing required
- **Functional patterns** - Prefer functions over classes
- **Interface over type** - Use interfaces for object shapes
- **Type inference** - Let TypeScript infer types where obvious
- **Path aliases** - Use `@/*` for imports from `src/` directory

#### Variable Naming
- **Boolean variables**: Prefix with `is`, `has`, `should` (e.g., `isLoading`, `hasError`, `shouldShow`)
- **Functions**: Verb-based names (e.g., `fetchMovies`, `updateRating`, `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE for true constants, camelCase for config objects
- **React components**: PascalCase for components, camelCase for instances

#### Code Organization
- **Component structure**: 
  1. Imports (external, internal, types, styles)
  2. Types/interfaces
  3. Component definition
  4. Hooks (queries, mutations, state)
  5. Event handlers
  6. Helper functions
  7. JSX return
- **File exports**: Named exports for utilities, default exports for pages/components
- **One component per file** - Unless tightly coupled subcomponents

### Architecture Patterns

#### Component Architecture
- **Server Components First** - Default to React Server Components (RSC)
- **Client Components** - Only use `'use client'` when necessary (interactivity, hooks, browser APIs)
- **Composition over inheritance** - Build complex UIs from simple components
- **Presentational vs Container** - Separate UI from logic where beneficial

#### State Management Strategy
- **Server State**: TanStack Query for all API data (movies, settings, counts)
  - Query keys defined centrally in `@/lib/query-keys.ts`
  - Optimistic updates for immediate UI feedback
  - Automatic cache invalidation and refetching
  - Background refetching with stale-while-revalidate
- **Global UI State**: React Context for sidebar, settings
- **Local State**: useState/useReducer for component-specific state
- **Form State**: React Hook Form with Zod validation

#### Data Flow Patterns
1. **Custom Hooks** - Encapsulate data fetching logic
   - `use-movie-queries.ts` - Read operations (GET)
   - `use-movie-mutations.ts` - Write operations (POST, PATCH, DELETE)
   - `use-movie-counts.ts` - Statistics and aggregations
   - `use-enhanced-movie-actions.ts` - Combined actions with optimistic updates
2. **Query Keys Factory** - Centralized query key management
3. **API Layer** - Next.js API routes in `app/api/` directory
4. **Database Layer** - Singleton database class with prepared statements

#### Error Handling
- **Early returns** - Guard clauses for preconditions and invalid states
- **Try-catch blocks** - Wrap async operations with proper error handling
- **Custom error types** - Consistent error shapes across the application
- **User feedback** - Toast notifications, error states, loading skeletons
- **Graceful degradation** - Fallback UI for failed operations

#### Performance Optimizations
- **Minimize client components** - Keep most components as RSC
- **Dynamic imports** - Code splitting for heavy components (VideoPlayer, VideoModal)
- **Image optimization** - WebP format, lazy loading, blur placeholders
- **Query optimization** - Proper pagination, search debouncing, efficient SQL queries
- **Memoization** - Use React.memo, useMemo, useCallback judiciously
- **Database indexing** - Indexes on frequently queried columns

### Testing Strategy

#### Testing Approach
- **Unit tests** - Component and utility function testing with Jest and React Testing Library
- **Integration tests** - API endpoint and database operation testing
- **E2E tests** - Critical user journeys (browse, search, favorite, watch)
- **Type safety** - TypeScript as first line of defense

#### Testing Priorities
1. Core data operations (CRUD for movies)
2. User interaction flows (favorites, watchlist, ratings)
3. CSV import functionality
4. Video player controls
5. Search and filtering
6. Responsive layouts

#### Quality Standards
- Test error cases and edge conditions
- Validate loading and error states
- Ensure accessibility (keyboard navigation, ARIA labels)
- Cross-browser compatibility (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Mobile responsiveness (320px-2560px)

### Git Workflow

#### Branching Strategy
- **main** - Production-ready code
- **feature/** - New features (e.g., `feature/csv-import`)
- **fix/** - Bug fixes (e.g., `fix/video-playback`)
- **refactor/** - Code improvements without functionality changes
- **docs/** - Documentation updates

#### Commit Conventions
Follow conventional commits specification:
- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code refactoring
- `style:` - Code style changes (formatting, no logic change)
- `docs:` - Documentation updates
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example: `feat: add CSV import with validation and progress tracking`

## Domain Context

### Movie Data Model
- **Unique Identifier**: `code` field (TEXT, unique constraint)
- **Required Fields**: code, title, videoUrl, coverUrl
- **Optional Fields**: description, rating (1-10), publishedAt
- **Boolean Flags**: isFavourite, isInWatchlist
- **Timestamps**: createdAt (auto), publishedAt (manual)

### Video Format Support
- **MP4**: Direct video playback using HTML5 video element
- **M3U8/HLS**: HTTP Live Streaming using HLS.js library
- **URL Detection**: Automatic format detection based on file extension
- **Proxy Support**: HLS proxy endpoint for CORS handling

### User Interactions
- **Favorites**: Toggle favorite status with heart icon
- **Watchlist**: Add/remove from "watch later" with clock icon
- **Ratings**: 1-10 scale using star-based UI (0.5 star increments displayed)
- **Optimistic Updates**: Immediate UI feedback with automatic rollback on errors

### Settings System
- **Grid Layout**: Configurable columns (1-5) and rows (1-10) per page
- **UI Preferences**: Header visibility, sidebar state
- **Persistence**: Local storage cache + database sync
- **Migration**: Automatic schema migration for setting changes

### CSV Import Format
**Required Columns**:
- `code` - Unique movie identifier (TEXT)
- `title` - Movie title (TEXT)
- `videoUrl` - Video file URL (TEXT, must be valid URL)

**Optional Columns**:
- `description` - Movie description (TEXT)
- `coverUrl` - Cover image URL (TEXT, must be valid URL)
- `isFavourite` - Favorite status (BOOLEAN, true/false)
- `rating` - User rating (INTEGER, 1-10)
- `publishedAt` - Publication date (DATETIME, ISO format)

**Validation Rules**:
- Duplicate codes are skipped with warnings
- Invalid URLs are rejected with error messages
- Ratings outside 1-10 range are rejected
- Maximum file size: 10MB
- Encoding: UTF-8

## Important Constraints

### Technical Constraints
- **SQLite Database**: Single-user, local file-based database
  - Location: `movies.db` in project root (configurable via `DB_PATH` env var)
  - No concurrent write transactions
  - Database file must be accessible by the Node.js process
- **Server-Side Rendering**: Most components run on the server (Next.js RSC)
- **API Rate Limiting**: No built-in rate limiting (local application)
- **File Upload Size**: 10MB maximum for CSV imports
- **Image Optimization**: Requires Sharp library for production builds

### Performance Constraints
- **Initial Page Load**: Must be under 3 seconds
- **Time to Interactive**: Under 5 seconds on standard broadband
- **Search Response**: Real-time results within 200ms
- **Video Start Time**: Playback starts within 2 seconds
- **Database Scale**: Optimized for 10,000+ movies

### Browser Requirements
- **Modern Browsers Only**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript Required**: Application is fully client-side rendered
- **Video Codec Support**: Browser must support H.264/MP4 and HLS (with HLS.js polyfill)

### Security Constraints
- **No Authentication**: Single-user application, no user accounts
- **Local Data Only**: All data stored locally, no external API calls
- **Input Validation**: Server-side validation for all user inputs
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Protection**: Content Security Policy (CSP) headers

### Design Constraints
- **Dark Theme Only**: Netflix-inspired dark color scheme (#0f0f0f, #1a1a1a, #262626)
- **Mobile-First**: Responsive design starting from 320px width
- **Accessibility**: WCAG 2.1 Level AA compliance target
- **Touch Targets**: Minimum 44px for mobile interactions

## External Dependencies

### Runtime Dependencies
- **better-sqlite3** (v12.1.0) - Native SQLite bindings
  - Requires compilation with node-gyp
  - Platform-specific binary builds
- **HLS.js** (v1.6.5) - HTTP Live Streaming playback
  - Required for M3U8 video support
  - Browser compatibility: Edge, Chrome, Firefox, Safari (with polyfill)
- **Papa Parse** (v5.5.3) - CSV parsing
  - Used for bulk movie imports
  - Handles various CSV formats and encodings
- **Sharp** (v0.34.2) - Image processing
  - Required for Next.js image optimization
  - Platform-specific native binaries

### Development Dependencies
- **Node.js**: v20+ (LTS recommended)
- **npm/pnpm/yarn**: Latest stable version
- **TypeScript**: v5+ with strict mode
- **ESLint**: Next.js recommended configuration

### Browser APIs Used
- **localStorage**: Settings cache persistence
- **Fetch API**: All HTTP requests
- **Video Element**: MP4 playback
- **MediaSource API**: HLS.js streaming (via polyfill)
- **IntersectionObserver**: Image lazy loading
- **ResizeObserver**: Responsive layout adjustments

### No External Services
- **No Authentication Service**: Self-contained application
- **No CDN**: All assets served locally
- **No Analytics**: Privacy-focused, no tracking
- **No External APIs**: All data managed locally
- **No Cloud Storage**: Local file system only

### Environment Variables
- `DB_PATH` - Optional custom database file path (default: `./movies.db`)
- `NODE_ENV` - Environment (development/production)
- `NEXT_PUBLIC_*` - Client-side environment variables (if needed)

### Deployment Considerations
- **Static Export Support**: Can be exported as static site (with API limitations)
- **File System Access**: Requires writable file system for SQLite database
- **Native Modules**: better-sqlite3 and Sharp require platform-compatible binaries
- **Hosting**: Node.js runtime required for API routes and database access
