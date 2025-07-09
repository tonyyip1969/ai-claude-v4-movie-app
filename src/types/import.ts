/**
 * Import-related type definitions for CSV import functionality
 */

export interface ImportResult {
  totalRows: number;
  successCount: number;
  skippedCount: number;
  errorCount: number;
  errors: ImportError[];
  skippedMovies: string[]; // movie codes that were skipped
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: CsvMovieData;
}

export interface CsvMovieData {
  code: string;
  title: string;
  description: string;
  videoUrl: string;
  coverUrl?: string;
  isFavourite?: boolean;
  rating?: number;
  publishedAt?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface BulkInsertResult {
  success: number;
  skipped: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}
