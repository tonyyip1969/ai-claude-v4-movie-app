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
