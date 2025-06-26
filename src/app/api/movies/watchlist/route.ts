import { NextRequest, NextResponse } from 'next/server';
import { movieDB } from '@/lib/database';

export async function GET() {
  try {
    const movies = movieDB.getWatchlistMovies();
    return NextResponse.json(movies);
  } catch (error) {
    console.error('Error fetching watchlist movies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchlist movies' },
      { status: 500 }
    );
  }
}
