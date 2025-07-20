import { NextRequest, NextResponse } from 'next/server';
import { movieDB } from '@/lib/database';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

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

    const result = movieDB.getMovies(page, limit);

    return NextResponse.json({
      ...result,
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}
