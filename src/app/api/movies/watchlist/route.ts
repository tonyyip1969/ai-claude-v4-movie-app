import { NextResponse } from 'next/server';
import { movieDB } from '@/lib/database';
import { SortOption } from '@/types/movie';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Valid sort options for validation
const VALID_SORT_OPTIONS: SortOption[] = ['createdAt', 'publishedAt', 'title', 'rating'];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sortBy = searchParams.get('sortBy') as SortOption | null;
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }
    
    // Validate sortBy parameter (whitelist approach)
    if (sortBy && !VALID_SORT_OPTIONS.includes(sortBy)) {
      return NextResponse.json(
        { error: `Invalid sortBy parameter. Allowed values: ${VALID_SORT_OPTIONS.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Get paginated results with sorting
    const result = movieDB.getWatchlistMoviesPaginated(page, limit, sortBy || undefined);
    
    return NextResponse.json({
      movies: result.movies,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching watchlist movies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchlist movies' },
      { status: 500 }
    );
  }
}
