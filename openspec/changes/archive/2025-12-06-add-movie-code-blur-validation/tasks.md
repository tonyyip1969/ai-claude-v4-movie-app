# Implementation Tasks

## Overview
Add blur-triggered validation for movie code uniqueness in the movie creation form.

## Prerequisites
- Existing API endpoint `/api/movies?code=X&excludeId=Y` for code uniqueness check
- Existing `validateCodeUniqueness` function in `@/lib/movie-validation.ts`

## Tasks

### Phase 1: Enhance CodeInput Component
- [x] **1.1** Add `onBlur` validation trigger to `CodeInput` component
  - Modify the component to validate on blur instead of (or in addition to) debounced typing
  - Add `validateOnBlur` prop to control validation timing
  - Ensure AbortController cancels pending requests on component unmount or re-validation

- [x] **1.2** Update error message for duplicate code
  - Change error message from "Movie code must be unique" to "Movie already exists"
  - Ensure error message is clear and actionable

### Phase 2: Integrate CodeInput into MovieEditForm
- [x] **2.1** Replace basic code input with `CodeInput` component in `MovieEditForm.tsx`
  - Import and use `CodeInput` component
  - Pass required props: `register`, `errors`, `watch`, `setError`, `clearErrors`
  - Pass `currentMovieId` for edit mode to exclude from uniqueness check

- [x] **2.2** Add React Hook Form integration
  - Integrate `CodeInput` with the existing form state management
  - Ensure form validation state reflects the async code validation result
  - Block form submission while code validation is in progress

### Phase 3: Visual Feedback
- [x] **3.1** Ensure proper visual indicators are shown
  - Red border on input when code already exists
  - Error icon in the input field
  - Error message displayed below the input
  - Loading spinner during validation

- [x] **3.2** Ensure accessibility
  - Error message linked to input via `aria-describedby`
  - Focus management after error display

### Phase 4: Testing & Validation
- [x] **4.1** Manual testing scenarios
  - Enter duplicate code, blur → error shown
  - Enter unique code, blur → success indicator shown
  - Edit existing movie, keep same code → no error (excluded by ID)
  - Rapid focus/blur cycling → no race conditions
  - Network failure during validation → form still submittable

- [x] **4.2** Verify form submission behavior
  - Form cannot be submitted while validation is pending
  - Form cannot be submitted if code validation has failed
  - Form can be submitted after successful validation

## Dependencies
- Task 2.1 depends on 1.1
- Task 3.1 depends on 2.1
- Task 4.1 depends on all previous tasks

## Verification
Run manual tests on the movie creation page (`/movie/new`) to verify:
1. Duplicate code detection works on blur
2. Error messages display correctly
3. Form submission is properly gated by validation state
