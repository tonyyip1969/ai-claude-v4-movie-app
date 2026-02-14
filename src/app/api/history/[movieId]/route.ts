import { NextRequest, NextResponse } from 'next/server';
import { movieDB } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { movieId: string } }
) {
  try {
    const movieId = parseInt(params.movieId, 10);
    if (Number.isNaN(movieId)) {
      return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 });
    }

    const progress = movieDB.getPlaybackProgress(movieId);
    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error fetching playback progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playback progress' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { movieId: string } }
) {
  try {
    const movieId = parseInt(params.movieId, 10);
    if (Number.isNaN(movieId)) {
      return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 });
    }

    const movie = movieDB.getMovieById(movieId);
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    const body = await request.json();
    const progressSeconds = Number(body.progressSeconds);
    const durationSeconds = Number(body.durationSeconds);

    if (!Number.isFinite(progressSeconds) || progressSeconds < 0) {
      return NextResponse.json({ error: 'Invalid progressSeconds' }, { status: 400 });
    }

    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      return NextResponse.json({ error: 'Invalid durationSeconds' }, { status: 400 });
    }

    movieDB.upsertPlaybackProgress(movieId, progressSeconds, durationSeconds);
    const progress = movieDB.getPlaybackProgress(movieId);

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error saving playback progress:', error);
    return NextResponse.json(
      { error: 'Failed to save playback progress' },
      { status: 500 }
    );
  }
}
