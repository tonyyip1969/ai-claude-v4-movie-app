import Papa from 'papaparse';
import { CsvMovieData, ValidationResult } from '@/types/import';

/**
 * Parses CSV content and returns structured movie data
 */
export function parseCsvContent(csvContent: string): Promise<CsvMovieData[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
          return;
        }
        resolve(results.data as CsvMovieData[]);
      },
      error: (error: Error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      }
    });
  });
}

/**
 * Validates movie data according to business rules
 */
export function validateMovieData(movieData: CsvMovieData): ValidationResult {
  const errors: string[] = [];

  // Required fields validation
  if (!movieData.code || movieData.code.trim() === '') {
    errors.push('Movie code is required');
  }

  if (!movieData.title || movieData.title.trim() === '') {
    errors.push('Movie title is required');
  }

  if (!movieData.description || movieData.description.trim() === '') {
    errors.push('Movie description is required');
  }

  if (!movieData.videoUrl || movieData.videoUrl.trim() === '') {
    errors.push('Video URL is required');
  }

  // URL validation
  if (movieData.videoUrl && !isValidUrl(movieData.videoUrl)) {
    errors.push('Video URL must be a valid URL');
  }

  if (movieData.coverUrl && !isValidUrl(movieData.coverUrl)) {
    errors.push('Cover URL must be a valid URL');
  }

  // Rating validation
  if (movieData.rating !== undefined) {
    const rating = Number(movieData.rating);
    if (isNaN(rating) || rating < 1 || rating > 10) {
      errors.push('Rating must be a number between 1 and 10');
    }
  }

  // Boolean validation
  if (movieData.isFavourite !== undefined) {
    const isFav = String(movieData.isFavourite).toLowerCase();
    if (!['true', 'false', '1', '0'].includes(isFav)) {
      errors.push('isFavourite must be true, false, 1, or 0');
    }
  }

  // Date validation
  if (movieData.publishedAt && !isValidDate(movieData.publishedAt)) {
    errors.push('publishedAt must be in YYYY-MM-DD format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Normalizes movie data by applying defaults and type conversions
 */
export function normalizeMovieData(movieData: CsvMovieData): CsvMovieData {
  return {
    code: movieData.code.trim(),
    title: movieData.title.trim(),
    description: movieData.description.trim(),
    videoUrl: movieData.videoUrl.trim(),
    coverUrl: movieData.coverUrl?.trim() || `https://picsum.photos/300/450?random=${Date.now()}`,
    isFavourite: movieData.isFavourite !== undefined 
      ? parseBooleanValue(movieData.isFavourite) 
      : false,
    rating: movieData.rating !== undefined 
      ? Number(movieData.rating) 
      : 5,
    publishedAt: movieData.publishedAt?.trim() || new Date().toISOString().split('T')[0]
  };
}

/**
 * Validates URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates date format (YYYY-MM-DD)
 */
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Parses boolean values from various string representations
 */
function parseBooleanValue(value: boolean | string): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  
  const stringValue = String(value).toLowerCase();
  return stringValue === 'true' || stringValue === '1';
}
