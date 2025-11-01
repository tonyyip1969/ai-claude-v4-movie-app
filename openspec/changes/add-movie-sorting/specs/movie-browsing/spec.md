# Movie Browsing - Spec Delta

## ADDED Requirements

### Requirement: Movie List Sorting
The system SHALL allow users to sort movie lists by multiple criteria to facilitate discovery and organization.

#### Scenario: Sort by creation date (recently added)
- **WHEN** user selects "Recently Added" sort option
- **THEN** movies are displayed in descending order by `createdAt` timestamp
- **AND** most recently imported/created movies appear first
- **AND** pagination maintains the sort order across pages

#### Scenario: Sort by publication date (default)
- **WHEN** user selects "Publication Date" sort option OR no sort option is specified
- **THEN** movies are displayed in descending order by `publishedAt` date
- **AND** most recently published movies appear first
- **AND** this matches the current default behavior for backward compatibility

#### Scenario: Sort by title alphabetically
- **WHEN** user selects "Title (A-Z)" sort option
- **THEN** movies are displayed in ascending alphabetical order by title
- **AND** sorting is case-insensitive
- **AND** special characters and numbers sort logically

#### Scenario: Sort by rating
- **WHEN** user selects "Rating (High to Low)" sort option
- **THEN** movies are displayed in descending order by rating value
- **AND** highest rated movies (10/10) appear first
- **AND** movies with null ratings are treated as 0 and appear last
- **AND** movies with equal ratings maintain stable order (secondary sort by title)

#### Scenario: Sort selection persists in URL
- **WHEN** user selects a sort option
- **THEN** the URL updates with `sortBy` query parameter
- **AND** the sort selection is preserved when sharing the URL
- **AND** browser back/forward navigation maintains the sort state
- **AND** refreshing the page maintains the selected sort

#### Scenario: Sort works with pagination
- **WHEN** user changes sort while on page 2 or higher
- **THEN** pagination resets to page 1
- **AND** the new sort order is applied
- **AND** navigating to subsequent pages maintains the selected sort
- **AND** page count remains accurate for the filtered results

#### Scenario: Invalid sort parameter handling
- **WHEN** API receives an invalid `sortBy` parameter value
- **THEN** the API returns a 400 Bad Request error
- **AND** an error message indicates the invalid parameter
- **AND** the request does not execute against the database

#### Scenario: Sort applies to favorites list
- **WHEN** user views favorites page with a sort selection
- **THEN** favorite movies are sorted according to the selected criteria
- **AND** non-favorite movies are excluded from results
- **AND** pagination works correctly with the sorted favorites

#### Scenario: Sort applies to watchlist
- **WHEN** user views watchlist page with a sort selection  
- **THEN** watchlist movies are sorted according to the selected criteria
- **AND** non-watchlist movies are excluded from results
- **AND** pagination works correctly with the sorted watchlist

### Requirement: Sort Control UI
The system SHALL provide an intuitive user interface for selecting sort options.

#### Scenario: Sort dropdown display
- **WHEN** user views the movie list page
- **THEN** a sort control dropdown is visible in the page header
- **AND** the control displays the currently active sort option
- **AND** the control is accessible via keyboard navigation
- **AND** the control is styled consistently with the dark theme

#### Scenario: Sort options menu
- **WHEN** user clicks or focuses the sort control
- **THEN** a dropdown menu displays all available sort options
- **AND** options are clearly labeled with human-readable names
- **AND** the currently selected option is visually indicated
- **AND** selecting an option closes the menu and applies the sort

#### Scenario: Sort control responsive behavior
- **WHEN** user views the sort control on mobile devices (< 768px)
- **THEN** the control remains accessible and functional
- **AND** the control adapts to smaller screen sizes appropriately
- **AND** touch interactions work smoothly

### Requirement: Sort API Parameter
The system SHALL accept and validate sort parameters in movie list API endpoints.

#### Scenario: Accept sortBy query parameter
- **WHEN** client sends GET request to `/api/movies?sortBy=createdAt`
- **THEN** the API accepts the sortBy parameter
- **AND** returns movies sorted by the specified field
- **AND** response includes the applied sort in metadata (if applicable)

#### Scenario: Validate sortBy values
- **WHEN** API receives a sortBy parameter
- **THEN** the value is validated against allowed options: 'createdAt', 'publishedAt', 'title', 'rating'
- **AND** any other value is rejected with 400 status code
- **AND** validation prevents SQL injection attacks

#### Scenario: Backward compatibility with missing sortBy
- **WHEN** client sends GET request without sortBy parameter
- **THEN** the API defaults to sorting by `publishedAt DESC`
- **AND** existing API consumers continue to work unchanged
- **AND** response format remains consistent

#### Scenario: Sort parameter in favorites endpoint
- **WHEN** client sends GET request to `/api/movies/favorites?sortBy=rating`
- **THEN** the API returns favorite movies sorted by rating
- **AND** pagination parameters work alongside sortBy
- **AND** only favorite movies are included in results

#### Scenario: Sort parameter in watchlist endpoint
- **WHEN** client sends GET request to `/api/movies/watchlist?sortBy=title`
- **THEN** the API returns watchlist movies sorted alphabetically
- **AND** pagination parameters work alongside sortBy
- **AND** only watchlist movies are included in results

### Requirement: Database Sort Implementation
The system SHALL perform sorting at the database level for optimal performance.

#### Scenario: SQL ORDER BY generation
- **WHEN** database method receives sortBy parameter
- **THEN** appropriate SQL ORDER BY clause is generated
- **AND** sorting is performed by SQLite engine
- **AND** only sorted page results are returned (not entire dataset)

#### Scenario: Handle null values in sorting
- **WHEN** sorting by a field that contains null values
- **THEN** null values are handled consistently
- **AND** for rating, nulls are treated as 0
- **AND** for dates, nulls sort to the end
- **AND** no SQL errors occur due to null values

#### Scenario: Case-insensitive title sorting
- **WHEN** sorting by title
- **THEN** sorting is case-insensitive using LOWER() SQL function
- **AND** "Avatar" and "avatar" sort together appropriately
- **AND** performance remains acceptable

#### Scenario: Multi-field sort for rating
- **WHEN** sorting by rating
- **THEN** movies with equal ratings are secondarily sorted by title
- **AND** sort order is stable and predictable
- **AND** user sees consistent ordering on repeated loads
