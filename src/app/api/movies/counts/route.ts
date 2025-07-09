import { NextResponse } from 'next/server';
import { movieDB } from '@/lib/database';

export async function GET() {
  try {
    const counts = movieDB.getMovieCounts();
    return NextResponse.json(counts);
  } catch (error) {
    console.error('Error fetching movie counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie counts' },
      { status: 500 }
    );
  }
}
