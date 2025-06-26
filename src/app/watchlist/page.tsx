'use client';

import { useState, useEffect } from 'react';
import { Movie } from '@/types/movie';
import MovieCard from '@/components/MovieCard';
import { MovieCardSkeleton } from '@/components/LoadingSkeleton';
import { Clock, Bookmark, Play } from 'lucide-react';

export default function WatchlistPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchlistChanging, setWatchlistChanging] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchWatchlistMovies = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/movies/watchlist');
        const data = await response.json();
        
        if (response.ok) {
          setMovies(data);
        } else {
          console.error('Failed to fetch watchlist movies');
        }
      } catch (error) {
        console.error('Error fetching watchlist movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlistMovies();
  }, []);

  const handleWatchlistToggle = async (movieId: number) => {
    setWatchlistChanging(prev => ({ ...prev, [movieId]: true }));
    
    try {
      const response = await fetch(`/api/movies/${movieId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'toggleWatchlist' }),
      });

      if (response.ok) {
        const { isInWatchlist } = await response.json();
        if (!isInWatchlist) {
          // Remove from watchlist locally
          setMovies(prev => prev.filter(movie => movie.id !== movieId));
        }
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    } finally {
      setWatchlistChanging(prev => ({ ...prev, [movieId]: false }));
    }
  };

  const handleFavoriteToggle = async (movieId: number) => {
    try {
      const response = await fetch(`/api/movies/${movieId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'toggleFavorite' }),
      });

      if (response.ok) {
        const { isFavourite } = await response.json();
        setMovies(prev => 
          prev.map(movie => 
            movie.id === movieId 
              ? { ...movie, isFavourite }
              : movie
          )
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
            <Clock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white">
            Watch{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              List
            </span>
          </h1>
        </div>
        
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Your personal collection of movies to watch later. Save interesting films here and never lose track of what you want to see next.
        </p>
      </div>

      {/* Content Section */}
      <div className="space-y-6">
        {/* Stats */}
        {!loading && (
          <div className="flex items-center justify-center space-x-3 text-sm text-gray-400">
            <Bookmark className="w-4 h-4" />
            <span>
              {movies.length} {movies.length === 1 ? 'movie' : 'movies'} in your watchlist
            </span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <MovieCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Movies Grid */}
        {!loading && movies.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onFavoriteToggle={handleFavoriteToggle}
                onWatchlistToggle={handleWatchlistToggle}
                className={watchlistChanging[movie.id] ? 'opacity-70 pointer-events-none' : ''}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && movies.length === 0 && (
          <div className="text-center py-16 space-y-6">
            <div className="w-24 h-24 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
              <Clock className="w-12 h-12 text-gray-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-gray-300">Your watchlist is empty</h3>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                Start building your watchlist by browsing movies and clicking the "Add to Watchlist" button on movies you want to watch later.
              </p>
            </div>
            <div className="flex justify-center">
              <a
                href="/"
                className="btn-primary flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Browse Movies</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      {!loading && movies.length > 0 && (
        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">About Your Watchlist</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Movies in your watchlist are saved for easy access. You can remove them anytime by clicking the watchlist button again. 
                This is perfect for keeping track of recommendations, upcoming releases, or movies you discover while browsing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
