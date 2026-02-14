import { NextRequest, NextResponse } from 'next/server';
import { movieDB } from '@/lib/database';

export const dynamic = 'force-dynamic';

const DEFAULT_HISTORY_LIMIT = 20;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitFromQuery = parseInt(searchParams.get('limit') || '', 10);

    const settings = movieDB.getAllSettings();
    const limitFromSettings = parseInt(settings.playHistoryLimit || '', 10);

    const limit = Number.isFinite(limitFromQuery) && limitFromQuery > 0
      ? limitFromQuery
      : Number.isFinite(limitFromSettings) && limitFromSettings > 0
        ? limitFromSettings
        : DEFAULT_HISTORY_LIMIT;

    const history = movieDB.getPlaybackHistory(limit);
    return NextResponse.json({ history, limit });
  } catch (error) {
    console.error('Error fetching playback history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playback history' },
      { status: 500 }
    );
  }
}
