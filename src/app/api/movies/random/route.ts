import { NextResponse } from 'next/server';
import { movieDB } from '@/lib/database';

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
