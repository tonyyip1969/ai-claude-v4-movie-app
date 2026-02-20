'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, History, PlayCircle, Trash2 } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { MoviePlayHistory } from '@/types/movie';
import VideoModal from '@/components/VideoModal';

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function HistoryPage() {
  const { settings, isLoaded } = useSettings();
  const [history, setHistory] = useState<MoviePlayHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeEntry, setActiveEntry] = useState<MoviePlayHistory | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/history?limit=${settings.playHistoryLimit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`);
      }
      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error(err);
      setError('Could not load playback history.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, settings.playHistoryLimit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCloseVideo = async () => {
    setActiveEntry(null);
    await fetchHistory();
  };

  const handleDeleteHistoryItem = async (movieId: number) => {
    try {
      const response = await fetch(`/api/history/${movieId}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(`Failed to delete history item: ${response.status}`);
      }
      await fetchHistory();
    } catch (err) {
      console.error(err);
      setError('Could not delete playback history item.');
    }
  };

  const handleDeleteAllHistory = async () => {
    try {
      const response = await fetch('/api/history', { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(`Failed to delete all history: ${response.status}`);
      }
      await fetchHistory();
    } catch (err) {
      console.error(err);
      setError('Could not clear playback history.');
    }
  };

  const formatWatchedDateTime = (updatedAt: string) => {
    const isoUtcString = updatedAt.includes('T')
      ? (updatedAt.endsWith('Z') ? updatedAt : `${updatedAt}Z`)
      : `${updatedAt.replace(' ', 'T')}Z`;

    const parsedDate = new Date(isoUtcString);
    if (Number.isNaN(parsedDate.getTime())) {
      return updatedAt;
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(parsedDate);
  };

  return (
    <div className="space-y-8">
      {settings.showHeader && (
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl">
              <History className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white">
              Watch <span className="bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">History</span>
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Continue watching from where you stopped. Showing up to {settings.playHistoryLimit} recent entries.
          </p>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Clock className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold text-white">History List</h2>
          {!isLoading && (
            <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
              {history.length} {history.length === 1 ? 'movie' : 'movies'}
            </span>
          )}
        </div>
        <button
          onClick={handleDeleteAllHistory}
          disabled={isLoading || history.length === 0}
          className="inline-flex items-center justify-center gap-2 bg-red-700/80 hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Remove all histories
        </button>
      </div>

      {isLoading && <p className="text-gray-400">Loading playback history...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!isLoading && !error && history.length === 0 && (
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-8 text-center text-gray-400">
          No playback history yet.
        </div>
      )}

      <div className="space-y-4">
        {history.map((entry) => {
          const progressPercent = entry.durationSeconds > 0
            ? Math.min(100, (entry.progressSeconds / entry.durationSeconds) * 100)
            : 0;

          return (
            <div key={entry.movieId} className="bg-gray-800/40 border border-gray-700 rounded-xl p-4">
              <div className="flex gap-4">
                <div className="relative w-48 shrink-0 aspect-video rounded-lg overflow-hidden bg-gray-800">
                  <Link href={`/movie/${entry.movieId}`} className="block h-full w-full">
                    <Image
                      src={entry.movie.coverUrl}
                      alt={entry.movie.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                      sizes="192px"
                    />
                  </Link>
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <h2 className="text-xl font-semibold text-white truncate">{entry.movie.title}</h2>
                    <p className="text-sm text-gray-400">Last watched {formatWatchedDateTime(entry.updatedAt)}</p>
                  </div>

                  <div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(entry.progressSeconds)} / {formatTime(entry.durationSeconds)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveEntry(entry)}
                      className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Continue watching
                    </button>
                    <button
                      onClick={() => handleDeleteHistoryItem(entry.movieId)}
                      className="inline-flex items-center gap-2 bg-red-700/80 hover:bg-red-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeEntry && (
        <VideoModal
          isOpen={true}
          onClose={handleCloseVideo}
          src={activeEntry.movie.videoUrl}
          poster={activeEntry.movie.coverUrl}
          title={activeEntry.movie.title}
          movieId={activeEntry.movieId}
        />
      )}
    </div>
  );
}
