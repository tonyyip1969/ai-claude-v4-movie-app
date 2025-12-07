import { NextRequest, NextResponse } from 'next/server';
import { movieDB } from '@/lib/database';
import { MovieCreatePayload, SortOption } from '@/types/movie';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Valid sort options for validation
const VALID_SORT_OPTIONS: SortOption[] = ['createdAt', 'publishedAt', 'title', 'rating'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Check if this is a code uniqueness validation request
    const code = searchParams.get('code');
    const excludeId = searchParams.get('excludeId');

    if (code !== null) {
      // Code uniqueness validation endpoint
      const excludeIdNum = excludeId ? parseInt(excludeId) : undefined;
      const existingMovie = movieDB.getMovieByCode(code, excludeIdNum);

      return NextResponse.json({
        exists: !!existingMovie,
        code,
        excludeId: excludeIdNum,
      });
    }

    // Regular movie listing endpoint
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') as SortOption | null;
    const tag = searchParams.get('tag') || undefined;

    // Validate sortBy parameter (whitelist approach)
    if (sortBy && !VALID_SORT_OPTIONS.includes(sortBy)) {
      return NextResponse.json(
        { error: `Invalid sortBy parameter. Allowed values: ${VALID_SORT_OPTIONS.join(', ')}` },
        { status: 400 }
      );
    }

    const result = movieDB.getMovies(page, limit, sortBy || undefined, tag);

    return NextResponse.json({
      ...result,
      currentPage: page,
      tag
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Extract and validate movie creation data
    const movieData: MovieCreatePayload = {
      title: body.title,
      code: body.code,
      videoUrl: body.videoUrl,
      coverUrl: body.coverUrl,
      description: body.description,
      publishedAt: body.publishedAt,
      rating: body.rating,
      tags: body.tags, // Add tags support
    };

    // Validate required fields
    const requiredFields = ['title', 'code', 'videoUrl', 'coverUrl'];
    const missingFields = requiredFields.filter(field => !movieData[field as keyof MovieCreatePayload]?.toString().trim());

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Create the movie using the database method
    const createdMovie = movieDB.createMovie(movieData);

    // Return the created movie
    return NextResponse.json(createdMovie, { status: 201 });

  } catch (error) {
    console.error('Error creating movie:', error);

    // Handle validation errors from database
    if (error instanceof Error) {
      // Check if it's a validation error (our database throws descriptive error messages)
      if (error.message.includes('already exists') ||
        error.message.includes('is required') ||
        error.message.includes('must be') ||
        error.message.includes('cannot be empty')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    // Generic server error for unexpected issues
    return NextResponse.json(
      { error: 'Failed to create movie' },
      { status: 500 }
    );
  }
}
