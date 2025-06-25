import { NextRequest, NextResponse } from 'next/server';
import { movieDB } from '@/lib/database';

export async function GET() {
  try {
    const movies = movieDB.getFavoriteMovies();
    return NextResponse.json({ movies });
  } catch (error) {
    console.error('Error fetching favorite movies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorite movies' },
      { status: 500 }
    );
  }
}
