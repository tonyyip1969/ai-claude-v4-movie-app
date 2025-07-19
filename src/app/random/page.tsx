'use client';

import { useState, useEffect } from 'react';
import { Movie } from '@/types/movie';
import MovieCard from '@/components/MovieCard';
import { MovieCardSkeleton } from '@/components/LoadingSkeleton';
import { Shuffle, RefreshCw, Dice6 } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useToggleFavorite, useToggleWatchlist } from '@/hooks/use-movie-mutations';

export default function RandomPage() {
  const { settings } = useSettings();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  // Use TanStack Query mutations for movie actions
  const favoriteMutation = useToggleFavorite();
  const watchlistMutation = useToggleWatchlist();

  const fetchRandomMovie = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/movies/random', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      const data = await response.json();
      
      if (response.ok) {
        setMovie(data);
      } else {
        console.error('Failed to fetch random movie');
      }
    } catch (error) {
      console.error('Error fetching random movie:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomMovie();
  }, []);

  const handleFavoriteToggle = async (movieId: number) => {
    if (!movie) return;
    favoriteMutation.mutate({ 
      movieId, 
      currentStatus: movie.isFavourite 
    });
    // Optimistically update local state
    setMovie(prev => prev ? { ...prev, isFavourite: !prev.isFavourite } : null);
  };

  const handleWatchlistToggle = async (movieId: number) => {
    if (!movie) return;
    watchlistMutation.mutate({ 
      movieId, 
      currentStatus: movie.isInWatchlist 
    });
    // Optimistically update local state
    setMovie(prev => prev ? { ...prev, isInWatchlist: !prev.isInWatchlist } : null);
  };

  const handleNewRandom = () => {
    fetchRandomMovie();
  };

  return (
    <div className="space-y-8">
      {/* Header Section - Conditionally rendered */}
      {settings.showHeader && (
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl">
              <Shuffle className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white">
              Random{' '}
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Discovery
              </span>
            </h1>
          </div>
          
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Can&apos;t decide what to watch? Let us surprise you! Discover new movies through our random selection feature and find your next favorite film.
          </p>
        </div>
      )}

      {/* Random Button - Always visible */}
      <div className="flex justify-center">
        <button
          onClick={handleNewRandom}
          disabled={loading}
          className="btn-primary flex items-center space-x-3 text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Getting Random Movie...' : 'Get Another Random Movie'}</span>
        </button>
      </div>

      {/* Content Section */}
      <div className="space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="px-40">
            <MovieCardSkeleton />
          </div>
        )}

        {/* Random Movie */}
        {!loading && movie && (
          <div className="px-40">
            <MovieCard
              movie={movie}
              onFavoriteToggle={handleFavoriteToggle}
              onWatchlistToggle={handleWatchlistToggle}
              className={favoriteMutation.isPending || watchlistMutation.isPending ? 'opacity-70 pointer-events-none' : ''}
            />
          </div>
        )}

        {/* No Movie Found */}
        {!loading && !movie && (
          <div className="text-center py-16 space-y-6">
            <div className="w-24 h-24 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
              <Shuffle className="w-12 h-12 text-gray-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-gray-300">No movies available</h3>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                There are no movies in the database to select from. Please check back later when movies have been added.
              </p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleNewRandom}
                className="btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      {!loading && movie && (
        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Shuffle className="w-5 h-5 text-purple-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Random Movie Selection</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Each time you click &quot;Get Another Random Movie&quot;, we&apos;ll surprise you with a different film from our collection. 
                This is a great way to discover movies you might not have found otherwise!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Shuffle className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Random Selection</h3>
          <p className="text-gray-400 text-sm">
            Get a completely random movie from our entire collection every time you click.
          </p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto bg-indigo-500/20 rounded-lg flex items-center justify-center">
            <Dice6 className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Discover New Films</h3>
          <p className="text-gray-400 text-sm">
            Find movies you might have missed or overlooked in our regular browsing.
          </p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto bg-pink-500/20 rounded-lg flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-pink-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Unlimited Tries</h3>
          <p className="text-gray-400 text-sm">
            Keep clicking for new random movies until you find something perfect to watch.
          </p>
        </div>
      </div>
    </div>
  );
}
