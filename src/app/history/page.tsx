'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { History, PlayCircle } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { MoviePlayHistory } from '@/types/movie';

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

  useEffect(() => {
    if (!isLoaded) return;

    const fetchHistory = async () => {
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
    };

    fetchHistory();
  }, [isLoaded, settings.playHistoryLimit]);

  return (
    <div className="space-y-8">
      {settings.showHeader && (
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
              <History className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white">
              Watch <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">History</span>
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Continue watching from where you stopped. Showing up to {settings.playHistoryLimit} recent entries.
          </p>
        </div>
      )}

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
                  <Image
                    src={entry.movie.coverUrl}
                    alt={entry.movie.title}
                    fill
                    className="object-cover"
                    sizes="192px"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <h2 className="text-xl font-semibold text-white truncate">{entry.movie.title}</h2>
                    <p className="text-sm text-gray-400">Last watched {new Date(entry.updatedAt).toLocaleString()}</p>
                  </div>

                  <div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(entry.progressSeconds)} / {formatTime(entry.durationSeconds)}
                    </p>
                  </div>

                  <Link
                    href={`/movie/${entry.movieId}`}
                    className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Continue watching
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
