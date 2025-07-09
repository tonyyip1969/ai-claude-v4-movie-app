import { NextResponse } from 'next/server';
import { movieDB } from '@/lib/database';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const movie = movieDB.getRandomMovie();
    
    if (!movie) {
      return NextResponse.json(
        { error: 'No movies found' },
        { status: 404 }
      );
    }

    return NextResponse.json(movie);
  } catch (error) {
    console.error('Error fetching random movie:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random movie' },
      { status: 500 }
    );
  }
}
