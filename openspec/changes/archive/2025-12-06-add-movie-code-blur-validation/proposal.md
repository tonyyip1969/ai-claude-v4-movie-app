# Proposal: Add Movie Code Blur Validation

## Change ID
`add-movie-code-blur-validation`

## Summary
Enhance the movie creation form by showing a "Movie already exists" error message when the user moves out of (blurs) the Movie Code input field if the entered code already exists in the database.

## Motivation
Currently, the movie creation form validates code uniqueness only after form submission, which leads to a poor user experience. Users discover duplicate code errors only after completing all other fields and attempting to save. By validating on blur:

1. **Immediate Feedback**: Users learn about duplicate codes as soon as they finish entering the code
2. **Reduced Frustration**: Prevents wasted effort filling out other form fields for a code that won't work
3. **Better UX**: Follows the principle of progressive validation

## Current Behavior
- The `MovieEditForm` component uses a basic input field for the movie code
- A `CodeInput` component exists with debounced real-time validation but is not integrated into the form
- Duplicate code errors are surfaced only on form submission via API response

## Proposed Behavior
- When the user blurs (moves focus away from) the Movie Code input field:
  - Validate that the code meets format requirements (3-20 chars, alphanumeric with hyphens/underscores)
  - Make an async API call to check if the code already exists in the database
  - If the code exists, display a clear error message: "Movie already exists"
  - Show visual indicators (red border, error icon) to draw attention to the issue
- Validation should only trigger if the code has at least 3 characters (minimum valid length)
- The form submit button should be disabled while validation is in progress
- In edit mode, exclude the current movie's ID from the uniqueness check

## Scope
- **Affected Components**: `MovieEditForm.tsx`, potentially `CodeInput.tsx`
- **API Changes**: None (existing `/api/movies?code=X&excludeId=Y` endpoint is sufficient)
- **New Dependencies**: None

## Success Criteria
1. Error message "Movie already exists" appears when user blurs a code field containing a duplicate code
2. Validation only triggers after blur, not during typing
3. Visual feedback (red border, error icon) accompanies the error message
4. Form submission is blocked while validation is pending
5. Validation works correctly in both create and edit modes

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Network latency delays feedback | Low UX quality | Show loading spinner during validation |
| API failure prevents validation | False positives | Fail open (allow submission), backend validates |
| Rapid blur/focus cycling | Race conditions | Cancel pending requests on new blur, use AbortController |

## Timeline
- Implementation: ~1-2 hours
- Testing: ~30 minutes

## Approval
- [ ] Approved for implementation
