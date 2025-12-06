import { z } from 'zod';

/**
 * Movie Edit Feature - Validation Schemas
 * 
 * Comprehensive Zod validation schemas for movie editing functionality.
 * Provides field-level validation, cross-field validation, and custom error messages.
 */

/**
 * URL validation regex - matches HTTP/HTTPS URLs
 */
const URL_REGEX = /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/;

/**
 * Movie code validation regex - alphanumeric and common symbols, 3-20 characters
 */
const MOVIE_CODE_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;

/**
 * Base validation schema for movie fields
 */
export const movieFieldValidation = {
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
    
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters'),
    
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .max(20, 'Code must be less than 20 characters')
    .regex(MOVIE_CODE_REGEX, 'Code can only contain letters, numbers, hyphens, and underscores')
    .trim(),
    
  publishedAt: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Optional field
        const date = new Date(val);
        return !isNaN(date.getTime()) && date <= new Date();
      },
      'Published date must be a valid date not in the future'
    ),
    
  coverUrl: z
    .string()
    .min(1, 'Cover image URL is required')
    .regex(URL_REGEX, 'Cover URL must be a valid HTTP/HTTPS URL')
    .trim(),
    
  videoUrl: z
    .string()
    .min(1, 'Video URL is required')
    .regex(URL_REGEX, 'Video URL must be a valid HTTP/HTTPS URL')
    .trim(),
};

/**
 * Movie form data validation schema
 * Used for client-side form validation
 */
export const movieFormSchema = z.object(movieFieldValidation);

/**
 * Movie update payload validation schema
 * Used for API request validation - all fields are optional for partial updates
 */
export const movieUpdateSchema = z.object({
  title: movieFieldValidation.title.optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  code: movieFieldValidation.code.optional(),
  publishedAt: movieFieldValidation.publishedAt,
  coverUrl: movieFieldValidation.coverUrl.optional(),
  videoUrl: movieFieldValidation.videoUrl.optional(),
}).refine(
  (data) => {
    // Ensure at least one field is being updated
    const fields = ['title', 'description', 'code', 'publishedAt', 'coverUrl', 'videoUrl'];
    return fields.some(field => data[field as keyof typeof data] !== undefined);
  },
  {
    message: 'At least one field must be provided for update',
    path: ['general']
  }
);

/**
 * Enhanced validation schema with cross-field validation
 * Includes code uniqueness validation for use with async validation
 */
export const movieFormSchemaWithAsync = movieFormSchema.extend({
  // This will be validated separately with async code uniqueness check
}).refine(
  (data) => {
    // Ensure video URL and cover URL are different if both provided
    if (data.videoUrl && data.coverUrl && data.videoUrl === data.coverUrl) {
      return false;
    }
    return true;
  },
  {
    message: 'Video URL and cover URL must be different',
    path: ['videoUrl']
  }
);

/**
 * Validation error type for form handling
 */
export type MovieValidationError = z.ZodError<z.infer<typeof movieFormSchema>>;

/**
 * Type-safe form data extracted from schema
 */
export type MovieFormData = z.infer<typeof movieFormSchema>;

/**
 * Type-safe update payload extracted from schema
 */
export type MovieUpdateData = z.infer<typeof movieUpdateSchema>;

/**
 * Utility function to format validation errors for form display
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(err.message);
  });
  
  return formatted;
}

/**
 * Utility function to validate a single field
 */
export function validateField(fieldName: keyof MovieFormData, value: unknown): string[] {
  try {
    const fieldSchema = movieFieldValidation[fieldName];
    fieldSchema.parse(value);
    return [];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues.map(err => err.message);
    }
    return ['Validation error'];
  }
}

/**
 * Async validation function for code uniqueness
 * To be used with React Hook Form's validate option
 */
export async function validateCodeUniqueness(
  code: string, 
  currentMovieId: number,
  signal?: AbortSignal
): Promise<string | true> {
  try {
    const response = await fetch(`/api/movies?code=${encodeURIComponent(code)}&excludeId=${currentMovieId}`, {
      method: 'GET',
      signal,
    });
    
    if (!response.ok) {
      throw new Error('Failed to validate code uniqueness');
    }
    
    const data = await response.json();
    
    if (data.exists) {
      return 'Movie already exists';
    }
    
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return true; // Ignore aborted requests
    }
    // On network error, allow the value (fail open)
    return true;
  }
}

/**
 * Default form values for new movie creation
 */
export const defaultMovieFormValues: MovieFormData = {
  title: '',
  description: '',
  code: '',
  publishedAt: '',
  coverUrl: '',
  videoUrl: '',
};

/**
 * Validation configuration for React Hook Form
 */
export const formValidationConfig = {
  mode: 'onChange' as const,
  reValidateMode: 'onChange' as const,
  shouldFocusError: true,
  criteriaMode: 'all' as const,
};
