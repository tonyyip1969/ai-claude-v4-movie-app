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
}

export interface PaginatedMovies {
  movies: Movie[];
  total: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Movie Edit Feature Types
 * Added as part of Phase 2: Data Layer & Type Safety
 */

/**
 * Payload interface for movie update API requests
 * Contains only the fields that can be updated via the edit form
 */
export interface MovieUpdatePayload {
  title?: string;
  description?: string;
  code?: string;
  publishedAt?: string;
  coverUrl?: string;
  videoUrl?: string;
}

/**
 * Form data interface for movie editing
 * Matches the editable fields with proper typing for form handling
 */
export interface MovieFormData {
  title: string;
  description: string;
  code: string;
  publishedAt: string;
  coverUrl: string;
  videoUrl: string;
}

/**
 * Validation errors interface for form error handling
 * Maps field names to their respective error messages
 */
export interface MovieValidationErrors {
  title?: string[];
  description?: string[];
  code?: string[];
  publishedAt?: string[];
  coverUrl?: string[];
  videoUrl?: string[];
  general?: string[];
}

/**
 * Form state modes for movie editing
 * Helps manage different states of the edit form
 */
export type MovieEditMode = 'editing' | 'saving' | 'saved' | 'error';

/**
 * Movie Creation Feature Types
 * Added as part of Movie Creation Feature Implementation
 */

/**
 * Payload interface for movie creation API requests
 * Contains all the fields needed to create a new movie
 */
export interface MovieCreatePayload {
  // Required fields
  title: string;
  code: string;        // REQUIRED per user request
  videoUrl: string;
  coverUrl: string;
  
  // Optional fields
  description?: string;
  publishedAt?: string; // Will default to today if not provided
  rating?: number;      // Will default to 5 if not provided
}

/**
 * Form data interface for movie creation
 * Matches the fields needed for creating a new movie with proper typing
 */
export interface MovieCreateFormData {
  title: string;
  description: string;
  code: string;
  publishedAt: string;  // Will be pre-filled with today's date
  coverUrl: string;
  videoUrl: string;
  rating: number;       // Will be pre-filled with 5
}

/**
 * Movie Sorting Feature Types
 * Added as part of Movie Sorting Feature Implementation
 */

/**
 * Sort options for movie lists
 * Defines the available fields by which movies can be sorted
 */
export type SortOption = 'createdAt' | 'publishedAt' | 'title' | 'rating';

/**
 * Sort order direction
 * Note: Currently not used as each sort option has a sensible default direction
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Parameters for movie list queries with sorting support
 */
export interface MovieListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: SortOption;
  type?: 'all' | 'favorites' | 'watchlist';
}
