import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UseFormRegister, FieldErrors, UseFormSetError, UseFormClearErrors, UseFormWatch } from 'react-hook-form';
import { MovieFormData, validateCodeUniqueness } from '@/lib/movie-validation';

interface CodeInputProps {
  name: 'code';
  label: string;
  placeholder?: string;
  register: UseFormRegister<MovieFormData>;
  errors: FieldErrors<MovieFormData>;
  watch: UseFormWatch<MovieFormData>;
  setError: UseFormSetError<MovieFormData>;
  clearErrors: UseFormClearErrors<MovieFormData>;
  currentMovieId?: number;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
  validateOnBlur?: boolean;
  onValidationStateChange?: (isValidating: boolean, hasError: boolean) => void;
}

/**
 * Code Input Component with Uniqueness Validation
 * 
 * Provides real-time validation for movie code uniqueness.
 * Shows loading state during validation and clear feedback.
 */
export function CodeInput({
  name,
  label,
  placeholder,
  register,
  errors,
  watch,
  setError,
  clearErrors,
  currentMovieId = 0,
  disabled = false,
  required = false,
  helpText,
  validateOnBlur = true,
  onValidationStateChange,
}: CodeInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [hasBlurred, setHasBlurred] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const watchedValue = watch(name);

  // Notify parent of validation state changes
  useEffect(() => {
    if (onValidationStateChange) {
      onValidationStateChange(isValidating, validationStatus === 'invalid');
    }
  }, [isValidating, validationStatus, onValidationStateChange]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Uniqueness validation with AbortController support
  const validateUniqueness = useCallback(async (code: string) => {
    if (!code || code.length < 3) {
      setValidationStatus('idle');
      clearErrors(name);
      return;
    }

    // Cancel any pending validation request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsValidating(true);
    
    try {
      const result = await validateCodeUniqueness(code, currentMovieId, abortControllerRef.current.signal);
      
      if (result === true) {
        setValidationStatus('valid');
        clearErrors(name);
      } else {
        setValidationStatus('invalid');
        setError(name, {
          type: 'uniqueness',
          message: result,
        });
      }
    } catch {
      // On error, remain in idle state (fail open)
      setValidationStatus('idle');
    } finally {
      setIsValidating(false);
    }
  }, [currentMovieId, setError, clearErrors, name]);

  // Validate on blur or when value changes after blur
  useEffect(() => {
    if (!watchedValue) {
      setValidationStatus('idle');
      setHasBlurred(false);
      return;
    }

    // Only validate if validateOnBlur is disabled OR user has already blurred
    if (!validateOnBlur || hasBlurred) {
      const timeoutId = setTimeout(() => {
        validateUniqueness(watchedValue);
      }, 300); // 300ms debounce for re-validation after blur

      return () => clearTimeout(timeoutId);
    }
  }, [watchedValue, validateUniqueness, validateOnBlur, hasBlurred]);

  // Handle blur event - trigger validation
  const handleBlur = useCallback(() => {
    setHasBlurred(true);
    if (watchedValue && watchedValue.length >= 3) {
      validateUniqueness(watchedValue);
    }
  }, [watchedValue, validateUniqueness]);

  const error = errors[name];
  const hasError = !!error;

  return (
    <div className="space-y-2">
      {/* Label */}
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Field */}
      <div className="relative">
        <input
          {...register(name)}
          id={name}
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          onBlur={handleBlur}
          aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
          aria-invalid={hasError}
          className={`
            w-full px-3 py-2 pr-10 border rounded-md shadow-sm
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
            dark:bg-gray-800 dark:border-gray-600 dark:text-white
            font-mono text-sm
            ${hasError 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : validationStatus === 'valid'
              ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
              : 'border-gray-300 dark:border-gray-600'
            }
          `}
        />
        
        {/* Status Indicator */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isValidating && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          )}
          
          {!isValidating && validationStatus === 'valid' && !hasError && (
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          
          {!isValidating && (validationStatus === 'invalid' || hasError) && (
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
      </div>

      {/* Validation Status Message */}
      {!hasError && validationStatus === 'valid' && (
        <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Code is available
        </p>
      )}

      {/* Help Text */}
      {helpText && !hasError && validationStatus !== 'valid' && (
        <p id={`${name}-help`} className="text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p id={`${name}-error`} role="alert" className="text-sm text-red-600 dark:text-red-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error.message}
        </p>
      )}

      {/* Loading overlay */}
      {isValidating && (
        <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-2"></div>
          Checking availability...
        </div>
      )}
    </div>
  );
}
