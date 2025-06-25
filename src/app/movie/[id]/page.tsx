'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Heart, Play, Star, Calendar, Code, Film } from 'lucide-react';
import { Movie } from '@/types/movie';
import VideoPlayer from '@/components/VideoPlayer';
import RatingComponent from '@/components/RatingComponent';
import { MovieDetailSkeleton } from '@/components/LoadingSkeleton';
import { cn, formatDate, truncateText } from '@/lib/utils';

interface MovieDetailPageProps {
  params: { id: string };
}

export default function MovieDetailPage({ params }: MovieDetailPageProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [favoriteChanging, setFavoriteChanging] = useState(false);
  const [ratingChanging, setRatingChanging] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

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
        <Link
          href="/"
          className="btn-primary flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Movies</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Movie Poster */}
        <div className="lg:col-span-1">
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 group">
            {!imageError ? (
              <Image
                src={movie.coverUrl}
                alt={movie.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 1024px) 100vw, 33vw"
                onError={() => setImageError(true)}
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <div className="text-gray-500 text-center">
                  <Film className="w-16 h-16 mx-auto mb-4" />
                  <p>Image not available</p>
                </div>
              </div>
            )}
            
            {/* Overlay with rating */}
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
              <span className="text-white font-bold text-lg">{movie.rating}/10</span>
            </div>
            
            {/* Favorite badge */}
            {movie.isFavourite && (
              <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-red-400/50">
                <Heart className="w-4 h-4 fill-white text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Movie Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Meta */}
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight">
                {movie.title}
              </h1>
              <div className="flex items-center space-x-4 text-gray-400">
                <div className="flex items-center space-x-1">
                  <Code className="w-4 h-4" />
                  <span className="font-mono text-sm">{movie.code}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{formatDate(movie.publishedAt)}</span>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-300">Rating</h3>
              <div className="flex flex-col space-y-2">
                <RatingComponent
                  rating={movie.rating}
                  onRatingChange={handleRatingChange}
                  size="lg"
                  showValue={true}
                  className={ratingChanging ? "opacity-50" : ""}
                />
                {ratingChanging && (
                  <p className="text-sm text-gray-500">Updating rating...</p>
                )}
                <p className="text-xs text-gray-500">Click the stars to rate this movie</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-300">Synopsis</h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                {movie.description}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Play Button */}
            <button
              onClick={() => setShowVideo(true)}
              className="btn-primary flex items-center space-x-3 text-lg px-8 py-4 w-full sm:w-auto justify-center"
            >
              <Play className="w-6 h-6 fill-white" />
              <span>Watch Now</span>
            </button>

            {/* Favorite Button */}
            <button
              onClick={handleFavoriteToggle}
              disabled={favoriteChanging}
              className={cn(
                "flex items-center space-x-2 px-6 py-4 rounded-lg border transition-all duration-300 w-full sm:w-auto justify-center",
                movie.isFavourite
                  ? "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                  : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500",
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
          </div>

          {/* Movie Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400">{movie.rating}/10</div>
              <div className="text-sm text-gray-500">User Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-400">{new Date(movie.publishedAt).getFullYear()}</div>
              <div className="text-sm text-gray-500">Release Year</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{movie.isFavourite ? 'Yes' : 'No'}</div>
              <div className="text-sm text-gray-500">Favorite</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{movie.code}</div>
              <div className="text-sm text-gray-500">Movie Code</div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Section */}
      {showVideo && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Now Playing</h2>
            <button
              onClick={() => setShowVideo(false)}
              className="text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Hide Player
            </button>
          </div>
          
          <div className="bg-black rounded-xl overflow-hidden">
            <VideoPlayer
              src={movie.videoUrl}
              poster={movie.coverUrl}
              title={movie.title}
            />
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
        <h3 className="text-xl font-semibold text-white">Movie Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Movie ID:</span>
            <span className="text-white ml-2">#{movie.id}</span>
          </div>
          <div>
            <span className="text-gray-400">Movie Code:</span>
            <span className="text-white ml-2 font-mono">{movie.code}</span>
          </div>
          <div>
            <span className="text-gray-400">Added:</span>
            <span className="text-white ml-2">{formatDate(movie.createdAt)}</span>
          </div>
          <div>
            <span className="text-gray-400">Published:</span>
            <span className="text-white ml-2">{formatDate(movie.publishedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
