# movie-creation Specification (Delta)

## ADDED Requirements

### Requirement: Movie Code Blur Validation
The system SHALL validate movie code uniqueness when the user blurs (moves focus away from) the Movie Code input field during movie creation or editing.

#### Scenario: Duplicate code detected on blur
- **GIVEN** the user is on the movie creation page (`/movie/new`) or movie edit page
- **WHEN** the user enters a movie code that already exists in the database
- **AND** the user moves focus away from the Movie Code input field (blur event)
- **THEN** the system displays an error message "Movie already exists"
- **AND** the input field shows a red border to indicate an error
- **AND** an error icon appears in the input field
- **AND** the form submit button is disabled until the error is resolved

#### Scenario: Unique code validated on blur
- **GIVEN** the user is on the movie creation page or movie edit page
- **WHEN** the user enters a movie code that does not exist in the database
- **AND** the user moves focus away from the Movie Code input field
- **THEN** the system displays a success indicator (green checkmark)
- **AND** the input field shows a green border to indicate success

#### Scenario: Minimum length requirement for validation
- **GIVEN** the user is on the movie creation page or movie edit page
- **WHEN** the user enters a movie code with fewer than 3 characters
- **AND** the user moves focus away from the Movie Code input field
- **THEN** the system does NOT trigger uniqueness validation
- **AND** standard format validation error is shown if applicable

#### Scenario: Edit mode excludes current movie from check
- **GIVEN** the user is editing an existing movie
- **WHEN** the user blurs the Movie Code field without changing the code
- **THEN** the system validates uniqueness excluding the current movie's ID
- **AND** no error is shown if the code matches only the current movie

#### Scenario: Network failure during validation
- **GIVEN** the user is on the movie creation page or movie edit page
- **WHEN** the user blurs the Movie Code input field
- **AND** the network request to validate uniqueness fails
- **THEN** the system fails open (allows form submission)
- **AND** the validation state resets to idle
- **AND** server-side validation will catch duplicates on submit

#### Scenario: Form submission blocked during validation
- **GIVEN** code validation is in progress (loading state)
- **WHEN** the user attempts to submit the form
- **THEN** the form submission is blocked
- **AND** the submit button shows a disabled state

#### Scenario: Form submission blocked with validation error
- **GIVEN** code validation has completed with an error (duplicate code)
- **WHEN** the user attempts to submit the form
- **THEN** the form submission is blocked
- **AND** focus is moved to the code input field
- **AND** the error message remains visible
