import { NextRequest, NextResponse } from 'next/server';
import { movieDB } from '@/lib/database';
import { parseCsvContent, validateMovieData, normalizeMovieData } from '@/lib/csvParser';
import { ImportResult, CsvMovieData } from '@/types/import';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * POST /api/movies/import
 * Handles CSV file upload and processes movie data import
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV file' },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Read file content
    const csvContent = await file.text();
    
    if (!csvContent.trim()) {
      return NextResponse.json(
        { error: 'CSV file is empty' },
        { status: 400 }
      );
    }

    // Parse CSV content
    let parsedData: CsvMovieData[];
    try {
      parsedData = await parseCsvContent(csvContent);
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 400 }
      );
    }

    if (parsedData.length === 0) {
      return NextResponse.json(
        { error: 'No valid data found in CSV file' },
        { status: 400 }
      );
    }

    // Validate and normalize data
    const validMovies: CsvMovieData[] = [];
    const importResult: ImportResult = {
      totalRows: parsedData.length,
      successCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [],
      skippedMovies: []
    };

    for (let i = 0; i < parsedData.length; i++) {
      const movieData = parsedData[i];
      
      // Skip if movie code already exists
      if (movieDB.checkMovieCodeExists(movieData.code)) {
        importResult.skippedCount++;
        importResult.skippedMovies.push(movieData.code);
        continue;
      }

      // Validate movie data
      const validation = validateMovieData(movieData);
      if (!validation.isValid) {
        importResult.errorCount++;
        importResult.errors.push({
          row: i + 1,
          message: validation.errors.join(', '),
          data: movieData
        });
        continue;
      }

      // Normalize and add to valid movies
      const normalizedMovie = normalizeMovieData(movieData);
      validMovies.push(normalizedMovie);
    }

    // Bulk insert valid movies
    if (validMovies.length > 0) {
      const bulkResult = movieDB.bulkInsertMovies(validMovies);
      importResult.successCount = bulkResult.success;
      
      // Add any bulk insert errors
      bulkResult.errors.forEach(error => {
        importResult.errorCount++;
        importResult.errors.push({
          row: error.row,
          message: error.error
        });
      });
    }

    // Return import results
    return NextResponse.json(importResult, { status: 200 });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Internal server error during import' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/movies/import
 * Returns CSV template and import guidelines
 */
export async function GET() {
  const template = {
    headers: ['code', 'title', 'description', 'videoUrl', 'coverUrl', 'isFavourite', 'rating', 'publishedAt'],
    example: [
      {
        code: 'MOV001',
        title: 'Example Movie',
        description: 'This is an example movie description',
        videoUrl: 'https://example.com/video.mp4',
        coverUrl: 'https://example.com/cover.jpg',
        isFavourite: false,
        rating: 8,
        publishedAt: '2024-01-15'
      }
    ],
    requiredFields: ['code', 'title', 'description', 'videoUrl'],
    optionalFields: [
      {
        field: 'coverUrl',
        default: 'auto-generated placeholder'
      },
      {
        field: 'isFavourite',
        default: false
      },
      {
        field: 'rating',
        default: 5,
        constraints: 'Must be between 1 and 10'
      },
      {
        field: 'publishedAt',
        default: 'current date',
        format: 'YYYY-MM-DD'
      }
    ]
  };

  return NextResponse.json(template, { status: 200 });
}
