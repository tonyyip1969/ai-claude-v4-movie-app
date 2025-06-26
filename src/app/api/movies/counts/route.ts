import { NextResponse } from 'next/server';
import { movieDB } from '@/lib/database';

export async function GET() {
  try {
    const favoriteMovies = movieDB.getFavoriteMovies();
    const watchlistMovies = movieDB.getWatchlistMovies();
    
    return NextResponse.json({
      favorites: favoriteMovies.length,
      watchlist: watchlistMovies.length
    });
  } catch (error) {
    console.error('Error fetching movie counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie counts' },
      { status: 500 }
    );
  }
}
