'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Heart, Play, Star, Calendar, Code, Film, Clock } from 'lucide-react';
import { Movie } from '@/types/movie';
import VideoModal from '@/components/VideoModal';
import RatingComponent from '@/components/RatingComponent';
import { MovieDetailSkeleton } from '@/components/LoadingSkeleton';
import { cn, formatDate } from '@/lib/utils';

interface MovieDetailPageProps {
  params: { id: string };
}

export default function MovieDetailPage({ params }: MovieDetailPageProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [favoriteChanging, setFavoriteChanging] = useState(false);
  const [watchlistChanging, setWatchlistChanging] = useState(false);
  const [ratingChanging, setRatingChanging] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get the page parameter from URL
  const returnPage = searchParams.get('page');

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/movies/${params.id}`);
        
        if (response.ok) {
          const movieData = await response.json();
          setMovie(movieData);
        } else if (response.status === 404) {
          setError('Movie not found');
        } else {
          setError('Failed to load movie');
        }
      } catch (error) {
        console.error('Error fetching movie:', error);
        setError('An error occurred while loading the movie');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [params.id]);

  const handleBackClick = () => {
    // Get the page parameter from URL
    const returnPage = searchParams.get('page');
    const fromPage = searchParams.get('from');
    
    // If we have a return page, navigate to the appropriate page with page parameter
    if (returnPage) {
      let targetUrl = '/';
      
      if (fromPage === 'favorites') {
        targetUrl = `/favorites?page=${returnPage}`;
      } else if (fromPage === 'watchlist') {
        targetUrl = `/watchlist?page=${returnPage}`;
      } else {
        // Default to homepage
        targetUrl = `/?page=${returnPage}`;
      }
      
      router.push(targetUrl);
    } else {
      // Fallback to browser back
      router.back();
    }
  };

  const handleFavoriteToggle = async () => {
    if (!movie || favoriteChanging) return;
    
    setFavoriteChanging(true);
    try {
      const response = await fetch(`/api/movies/${movie.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'toggleFavorite' }),
      });

      if (response.ok) {
        const { isFavourite } = await response.json();
        setMovie(prev => prev ? { ...prev, isFavourite } : null);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteChanging(false);
    }
  };

  const handleWatchlistToggle = async () => {
    if (!movie || watchlistChanging) return;
    
    setWatchlistChanging(true);
    try {
      const response = await fetch(`/api/movies/${movie.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'toggleWatchlist' }),
      });

      if (response.ok) {
        const { isInWatchlist } = await response.json();
        setMovie(prev => prev ? { ...prev, isInWatchlist } : null);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    } finally {
      setWatchlistChanging(false);
    }
  };

  const handleRatingChange = async (newRating: number) => {
    if (!movie || ratingChanging) return;
    
    setRatingChanging(true);
    try {
      const response = await fetch(`/api/movies/${movie.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'updateRating',
          rating: newRating 
        }),
      });

      if (response.ok) {
        const { rating } = await response.json();
        setMovie(prev => prev ? { ...prev, rating } : null);
      } else {
        const errorData = await response.json();
        console.error('Error updating rating:', errorData.error);
      }
    } catch (error) {
      console.error('Error updating rating:', error);
    } finally {
      setRatingChanging(false);
    }
  };

  if (loading) {
    return <MovieDetailSkeleton />;
  }

  if (error || !movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
          <Film className="w-12 h-12 text-gray-600" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-300">
            {error || 'Movie not found'}
          </h1>
          <p className="text-gray-500 max-w-md">
            {error === 'Movie not found' 
              ? "The movie you're looking for doesn't exist or has been removed."
              : "There was a problem loading this movie. Please try again later."
            }
          </p>
        </div>
        <button
          onClick={handleBackClick}
          className="btn-primary flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Movies</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        {!imageError ? (
          <Image
            src={movie.coverUrl}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-900" />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Navigation Header */}
        <div className="flex items-center justify-between px-2 py-6">
          <button
            onClick={handleBackClick}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors group bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 hover:bg-black/50"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12 px-2 pb-6">
          {/* Left Side - Movie Poster and Rating */}
          <div className="flex-[3] space-y-6">
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-800 shadow-2xl">
              {!imageError ? (
                <Image
                  src={movie.coverUrl}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <div className="text-gray-500 text-center">
                    <Film className="w-16 h-16 mx-auto mb-4" />
                    <p>Image not available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setShowVideo(true)}
                className="flex items-center justify-center space-x-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Play Movie</span>
              </button>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleFavoriteToggle}
                  disabled={favoriteChanging}
                  className={cn(
                    "flex items-center justify-center space-x-2 border-2 font-semibold px-8 py-4 rounded-lg transition-all",
                    movie.isFavourite
                      ? "bg-red-600/20 border-red-500 text-red-400 hover:bg-red-600/30"
                      : "border-white/30 text-white hover:bg-white/10",
                    favoriteChanging && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Heart className={cn(
                    "w-5 h-5 transition-colors",
                    movie.isFavourite ? "fill-red-400 text-red-400" : ""
                  )} />
                  <span>
                    {favoriteChanging 
                      ? 'Updating...' 
                      : movie.isFavourite 
                        ? 'Remove from Favorites' 
                        : 'Add to Favorites'
                    }
                  </span>
                </button>

                <button
                  onClick={handleWatchlistToggle}
                  disabled={watchlistChanging}
                  className={cn(
                    "flex items-center justify-center space-x-2 border-2 font-semibold px-8 py-4 rounded-lg transition-all",
                    movie.isInWatchlist
                      ? "bg-blue-600/20 border-blue-500 text-blue-400 hover:bg-blue-600/30"
                      : "border-white/30 text-white hover:bg-white/10",
                    watchlistChanging && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Clock className={cn(
                    "w-5 h-5 transition-colors",
                    movie.isInWatchlist ? "fill-blue-400 text-blue-400" : ""
                  )} />
                  <span>
                    {watchlistChanging 
                      ? 'Updating...' 
                      : movie.isInWatchlist 
                        ? 'Remove from Watchlist' 
                        : 'Add to Watchlist'
                    }
                  </span>
                </button>
              </div>
            </div>

            {/* Interactive Rating */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-white">Rate This Movie</h3>
              <div className="flex flex-col space-y-2">
                <RatingComponent
                  rating={movie.rating}
                  onRatingChange={handleRatingChange}
                  size="lg"
                  showValue={true}
                  className={ratingChanging ? "opacity-50" : ""}
                />
                {ratingChanging && (
                  <p className="text-sm text-gray-400">Updating rating...</p>
                )}
                <p className="text-xs text-gray-400">Click the stars to rate this movie</p>
              </div>
            </div>
          </div>

          {/* Right Side - Movie Information */}
          <div className="flex-1 space-y-6">
            {/* Title and Meta */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                {movie.title}
              </h1>
              
              {/* Rating and Year */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-white font-semibold">{movie.rating}/10</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4 text-gray-300" />
                  <span className="text-gray-300">{new Date(movie.publishedAt).getFullYear()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Code className="w-4 h-4 text-gray-300" />
                  <span className="text-gray-300 font-mono">{movie.code}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-white">Description</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {movie.description}
              </p>
            </div>

            {/* Movie Details Grid */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-white">Movie Details</h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                <div>
                  <span className="text-gray-400">Movie ID:</span>
                  <span className="text-white ml-2">#{movie.id}</span>
                </div>
                <div>
                  <span className="text-gray-400">Code:</span>
                  <span className="text-white ml-2 font-mono">{movie.code}</span>
                </div>
                <div>
                  <span className="text-gray-400">Rating:</span>
                  <span className="text-white ml-2">{movie.rating}/10</span>
                </div>
                <div>
                  <span className="text-gray-400">Published:</span>
                  <span className="text-white ml-2">{formatDate(movie.publishedAt)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Added:</span>
                  <span className="text-white ml-2">{formatDate(movie.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Favorite:</span>
                  <span className="text-white ml-2">{movie.isFavourite ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="text-gray-400">In Watchlist:</span>
                  <span className="text-white ml-2">{movie.isInWatchlist ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={showVideo}
        onClose={() => setShowVideo(false)}
        src={movie.videoUrl}
        poster={movie.coverUrl}
        title={movie.title}
      />
    </div>
  );
}
