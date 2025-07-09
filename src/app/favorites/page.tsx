'use client';

import { useState, useEffect } from 'react';
import { Movie } from '@/types/movie';
import MovieCard from '@/components/MovieCard';
import { MovieGridSkeleton } from '@/components/LoadingSkeleton';
import { Heart, HeartOff } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

export default function FavoritesPage() {
  const { settings } = useSettings();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteChanging, setFavoriteChanging] = useState<number | null>(null);
  // Removed unused ratingChanging state to resolve lint error
  // const [ratingChanging, setRatingChanging] = useState<number | null>(null);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/movies/favorites', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      const data = await response.json();
      
      if (response.ok) {
        setMovies(data.movies || []);
      } else {
        console.error('Failed to fetch favorite movies');
      }
    } catch (error) {
      console.error('Error fetching favorite movies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = async (movieId: number) => {
    setFavoriteChanging(movieId);
    
    try {
      const response = await fetch(`/api/movies/${movieId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'toggleFavorite' }),
      });

      if (response.ok) {
        // Remove the movie from favorites list since it's no longer a favorite
        setMovies(prev => prev.filter(movie => movie.id !== movieId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteChanging(null);
    }
  };

  // Handle rating update
  const handleRatingUpdate = async (movieId: number, rating: number) => {
    // setRatingChanging(movieId); // Removed unused state
    
    try {
      const response = await fetch(`/api/movies/${movieId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'updateRating', rating }),
      });

      if (response.ok) {
        // Update the movie rating in current state
        setMovies(prev => 
          prev.map(movie => 
            movie.id === movieId 
              ? { ...movie, rating } 
              : movie
          )
        );
      } else {
        const errorData = await response.json();
        console.error('Failed to update rating:', errorData);
      }
    } catch (error) {
      console.error('Error updating rating:', error);
    } finally {
      // setRatingChanging(null); // Removed unused state
    }
  };

  // Handle watchlist toggle
  const handleWatchlistToggle = async (movieId: number) => {
    setFavoriteChanging(movieId); // Reuse the same loading state
    
    try {
      const response = await fetch(`/api/movies/${movieId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'toggleWatchlist' }),
      });

      if (response.ok) {
        const data = await response.json();
        const { isInWatchlist } = data;
        
        // Update the movie watchlist status in current state
        setMovies(prev => 
          prev.map(movie => 
            movie.id === movieId 
              ? { ...movie, isInWatchlist } 
              : movie
          )
        );
      } else {
        const errorData = await response.json();
        console.error('Failed to toggle watchlist:', errorData);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    } finally {
      setFavoriteChanging(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
            <Heart className="w-7 h-7 text-white fill-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white">
            Your&nbsp;
            <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Favorites
            </span>
          </h1>
        </div>
        
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Your personally curated collection of favorite movies. All the films you&apos;ve marked as favorites are here for easy access.
        </p>
      </div>

      {/* Content Section */}
      <div className="space-y-6">
        {/* Section Header */}
        {!loading && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="w-6 h-6 text-red-400 fill-red-400" />
              <h2 className="text-2xl font-bold text-white">Favorite Movies</h2>
              <span className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm">
                {movies.length} {movies.length === 1 ? 'movie' : 'movies'}
              </span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <MovieGridSkeleton />}

        {/* Movies Grid */}
        {!loading && movies.length > 0 && (
          <div 
            className="grid gap-6"
            style={{
              gridTemplateColumns: `repeat(${settings.gridColumns}, 1fr)`
            }}
          >
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onFavoriteToggle={handleFavoriteToggle}
                onRatingUpdate={handleRatingUpdate}
                onWatchlistToggle={handleWatchlistToggle}
                className={favoriteChanging === movie.id ? 'opacity-70 pointer-events-none' : ''}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && movies.length === 0 && (
          <div className="text-center py-16 space-y-6">
            <div className="w-24 h-24 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
              <HeartOff className="w-12 h-12 text-gray-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-gray-300">No favorites yet</h3>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                You haven&apos;t added any movies to your favorites. Browse our collection and click the heart icon on movies you love to add them here.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <a
                href="/"
                className="btn-primary flex items-center space-x-2"
              >
                <Heart className="w-4 h-4" />
                <span>Browse Movies</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Tips Section */}
      {!loading && movies.length > 0 && (
        <div className="bg-gradient-to-br from-red-900/20 to-pink-900/20 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Manage Your Favorites</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                You can remove movies from your favorites by clicking the heart icon on any movie card. 
                Your favorites are saved and will be here whenever you return.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
