import { NextResponse } from 'next/server';
import { movieDB } from '@/lib/database';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }
    
    // Get paginated results
    const result = movieDB.getFavoriteMoviesPaginated(page, limit);
    
    return NextResponse.json({
      movies: result.movies,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching favorite movies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorite movies' },
      { status: 500 }
    );
  }
}
