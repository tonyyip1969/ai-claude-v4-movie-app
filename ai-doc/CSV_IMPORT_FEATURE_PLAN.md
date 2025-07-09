# CSV Import Feature Development Plan

## Overview
This document outlines the implementation plan for adding CSV import functionality to the movie database application. The feature will allow users to upload CSV files containing movie data and import them into the existing database.

## Feature Requirements

### Core Requirements
1. **UI Component**: File upload interface for CSV files
2. **Backend Processing**: Parse and validate CSV data
3. **Import Logic**: Insert new movies while skipping existing ones (based on movie code)
4. **Error Handling**: Comprehensive validation and error reporting
5. **User Feedback**: Progress indication and import results

### Field Mapping
- **Required Fields**: `code`, `title`, `description`, `videoUrl`
- **Optional Fields**: 
  - `coverUrl` (default: auto-generated placeholder)
  - `isFavourite` (default: false)
  - `rating` (default: 5, range: 1-10)
  - `publishedAt` (default: current date)

### Business Logic
- Skip records where movie code already exists
- Validate required fields are present
- Validate data types and constraints
- Provide detailed import summary

## Technical Implementation Plan

### 1. Database Layer Updates
**File**: `src/lib/database.ts`

#### New Methods to Add:
```typescript
// Check if movie code exists
checkMovieCodeExists(code: string): boolean

// Bulk insert movies with validation
bulkInsertMovies(movies: Partial<Movie>[]): {
  success: number;
  skipped: number;
  errors: Array<{row: number, error: string}>;
}

// Validate movie data
validateMovieData(movieData: Partial<Movie>): {
  isValid: boolean;
  errors: string[];
}
```

### 2. API Endpoints
**File**: `src/app/api/movies/import/route.ts` (new)

#### Endpoints:
- `POST /api/movies/import` - Handle CSV file upload and processing

#### Request Handling:
- Accept multipart/form-data with CSV file
- Parse CSV using a library like `papaparse`
- Validate and process data
- Return import results

### 3. UI Components

#### 3.1 Import Page
**File**: `src/app/import/page.tsx` (new)
- Main import interface
- File upload area
- Import results display
- Progress indicator

#### 3.2 CSV Upload Component
**File**: `src/components/CsvUpload.tsx` (new)
- Drag & drop file upload
- File validation (CSV only)
- Upload progress
- Preview of CSV data

#### 3.3 Import Results Component
**File**: `src/components/ImportResults.tsx` (new)
- Success/failure statistics
- Detailed error list
- Skipped records summary

### 4. Types and Interfaces
**File**: `src/types/import.ts` (new)

```typescript
interface ImportResult {
  totalRows: number;
  successCount: number;
  skippedCount: number;
  errorCount: number;
  errors: ImportError[];
  skippedMovies: string[]; // movie codes
}

interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: any;
}

interface CsvMovieData {
  code: string;
  title: string;
  description: string;
  videoUrl: string;
  coverUrl?: string;
  isFavourite?: boolean;
  rating?: number;
  publishedAt?: string;
}
```

### 5. Utilities
**File**: `src/lib/csvParser.ts` (new)
- CSV parsing logic
- Data validation
- Error handling utilities

## Implementation Status

### ✅ Phase 1: Backend Foundation (COMPLETED)
1. **✅ Database Methods** (2-3 hours)
   - ✅ Added validation methods to `MovieDatabase` class
   - ✅ Implemented bulk insert functionality
   - ✅ Added duplicate checking logic
   - ✅ Added movie counts functionality

2. **✅ API Endpoint** (2-3 hours)
   - ✅ Created import route handler at `/api/movies/import`
   - ✅ Implemented CSV parsing with Papa Parse
   - ✅ Added comprehensive error handling and validation
   - ✅ Updated counts endpoint to use new database method

3. **✅ Type Definitions** (1 hour)
   - ✅ Created import-related interfaces in `src/types/import.ts`
   - ✅ Added proper TypeScript typing for all functions

4. **✅ Utilities** (1 hour)
   - ✅ Created CSV parser utility with validation
   - ✅ Added data normalization functions
   - ✅ Implemented comprehensive validation rules

### ✅ Completed Files in Phase 1
```
src/
├── types/
│   └── import.ts ✅ (NEW)
├── lib/
│   ├── database.ts ✅ (UPDATED - added new methods)
│   └── csvParser.ts ✅ (NEW)
└── app/
    └── api/
        └── movies/
            ├── import/
            │   └── route.ts ✅ (NEW)
            └── counts/
                └── route.ts ✅ (UPDATED)
```

### ✅ Key Features Implemented
- **CSV File Upload**: POST `/api/movies/import` endpoint
- **Data Validation**: Comprehensive validation rules for all fields
- **Duplicate Prevention**: Skip movies with existing codes
- **Bulk Operations**: Efficient database transactions
- **Error Handling**: Detailed error reporting with row numbers
- **Type Safety**: Full TypeScript support
- **CSV Template**: GET `/api/movies/import` returns template info

### ✅ Phase 2: UI Implementation (COMPLETED)
1. **✅ Upload Component** (3-4 hours)
   - ✅ Created modern drag & drop interface in `CsvUpload.tsx`
   - ✅ Added comprehensive file validation (CSV only, 10MB limit)
   - ✅ Implemented progress tracking with visual indicators
   - ✅ Added file format guidelines and examples

2. **✅ Import Page** (2-3 hours)
   - ✅ Created main import interface at `/import`
   - ✅ Integrated upload component with state management
   - ✅ Added results display and error handling
   - ✅ Included template download and format guide features

3. **✅ Results Component** (2-3 hours)
   - ✅ Created detailed results view in `ImportResults.tsx`
   - ✅ Added comprehensive error display with export functionality
   - ✅ Implemented success/failure statistics with visual indicators
   - ✅ Added CSV export for error analysis

4. **✅ Navigation Integration**
   - ✅ Added "Import" link to sidebar navigation
   - ✅ Integrated with existing UI design system

### ✅ Completed Files in Phase 2
```
src/
├── app/
│   └── import/
│       └── page.tsx ✅ (NEW - Main import interface)
├── components/
│   ├── CsvUpload.tsx ✅ (NEW - Drag & drop upload)
│   ├── ImportResults.tsx ✅ (NEW - Results display)
│   └── Sidebar.tsx ✅ (UPDATED - Added import link)
```

### ✅ Key UI Features Implemented
- **Modern Drag & Drop**: Intuitive file upload with visual feedback
- **Real-time Validation**: Instant file type and size validation
- **Progress Tracking**: Visual progress indicators during import
- **Comprehensive Results**: Detailed statistics and error reporting
- **Error Export**: Export errors to CSV for analysis
- **Template Download**: Download CSV template with examples
- **Responsive Design**: Mobile-first responsive layout
- **Dark Mode Support**: Full dark/light theme compatibility
- **Accessibility**: Screen reader friendly with proper ARIA labels

### 🔄 Phase 3: Integration & Testing (PENDING)
1. **Integration** (2-3 hours)
   - Connect frontend to backend
   - Test end-to-end functionality
   - Add navigation links

2. **Error Handling** (1-2 hours)
   - Comprehensive error scenarios
   - User-friendly error messages
   - Edge case handling

3. **UI Polish** (1-2 hours)
   - Responsive design
   - Loading states
   - Success animations

## File Structure Changes

### New Files
```
src/
├── app/
│   ├── import/
│   │   └── page.tsx
│   └── api/
│       └── movies/
│           └── import/
│               └── route.ts
├── components/
│   ├── CsvUpload.tsx
│   └── ImportResults.tsx
├── lib/
│   └── csvParser.ts
└── types/
    └── import.ts
```

### Modified Files
```
src/
├── lib/
│   └── database.ts (add new methods)
├── components/
│   └── Sidebar.tsx (add import link)
└── types/
    └── movie.ts (update if needed)
```

## Dependencies to Add

### Required NPM Packages
```json
{
  "papaparse": "^5.4.1",
  "@types/papaparse": "^5.3.14"
}
```

### Optional Enhancement Packages
```json
{
  "react-dropzone": "^14.2.3",
  "react-csv": "^2.2.2"
}
```

## CSV Format Specification

### Required Format
```csv
code,title,description,videoUrl,coverUrl,isFavourite,rating,publishedAt
MOV001,"Movie Title","Movie description","https://example.com/video.mp4","https://example.com/cover.jpg",false,8,"2024-01-15"
```

### Field Specifications
- **code**: Unique identifier (string, required)
- **title**: Movie title (string, required)
- **description**: Movie description (string, required)
- **videoUrl**: Video URL (string, required, must be valid URL)
- **coverUrl**: Cover image URL (string, optional)
- **isFavourite**: Boolean (optional, default: false)
- **rating**: Integer 1-10 (optional, default: 5)
- **publishedAt**: Date in YYYY-MM-DD format (optional, default: current date)

## Error Handling Strategy

### Validation Rules
1. **Required Fields**: Ensure all required fields are present
2. **Data Types**: Validate boolean and numeric fields
3. **URL Validation**: Check if URLs are properly formatted
4. **Date Validation**: Ensure dates are in correct format
5. **Rating Range**: Validate rating is between 1-10
6. **Duplicate Codes**: Check for existing movie codes

### Error Categories
1. **File Errors**: Invalid file format, empty file, parsing errors
2. **Validation Errors**: Missing required fields, invalid data types
3. **Business Logic Errors**: Duplicate codes, constraint violations
4. **System Errors**: Database connection issues, server errors

## User Experience Considerations

### Upload Flow
1. User navigates to import page
2. Drag & drop or select CSV file
3. File validation and preview
4. Confirm import operation
5. Show progress during import
6. Display detailed results

### Progress Indication
- File upload progress
- Processing progress
- Real-time error count
- Success/failure indicators

### Results Display
- Summary statistics
- Detailed error list with row numbers
- List of skipped movies (duplicates)
- Success confirmation

## Performance Considerations

### Large File Handling
- Streaming CSV parsing
- Batch processing
- Memory usage optimization
- Progress reporting

### Database Performance
- Bulk insert operations
- Transaction handling
- Index optimization
- Connection pooling

## Future Enhancements

### Phase 2 Features
1. **Export Functionality**: Export movies to CSV
2. **Template Download**: Provide CSV template
3. **Batch Operations**: Edit multiple movies
4. **Import History**: Track import operations

### Advanced Features
1. **Data Mapping**: Custom field mapping
2. **Validation Rules**: Configurable validation
3. **Rollback**: Undo import operations
4. **Scheduled Imports**: Automated imports

## Conclusion

This plan provides a comprehensive approach to implementing CSV import functionality while maintaining code quality, security, and user experience standards. The phased approach allows for iterative development and testing, ensuring a robust and reliable feature implementation.

The implementation follows Next.js best practices and integrates seamlessly with the existing application architecture. The modular design allows for future enhancements and maintains the clean code principles established in the project.
