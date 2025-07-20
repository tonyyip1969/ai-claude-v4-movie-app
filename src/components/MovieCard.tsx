'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Play, Clock, Edit } from 'lucide-react';
import { Movie } from '@/types/movie';
import { cn } from '@/lib/utils';
import RatingComponent from './RatingComponent';
import { useEnhancedMovieActions } from '@/hooks/use-enhanced-movie-actions';

interface MovieCardProps {
  movie: Movie;
  onFavoriteToggle?: (id: number) => void;
  onWatchlistToggle?: (id: number) => void;
  onRatingUpdate?: (id: number, rating: number) => void;
  className?: string;
  currentPage?: number;
  pageContext?: 'home' | 'favorites' | 'watchlist';
  /** Use enhanced TanStack Query actions instead of callbacks (recommended) */
  useEnhancedActions?: boolean;
}

export default function MovieCard({ 
  movie, 
  onFavoriteToggle, 
  onWatchlistToggle, 
  onRatingUpdate, 
  className, 
  currentPage, 
  pageContext = 'home',
  useEnhancedActions = false 
}: MovieCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Use enhanced movie actions if enabled
  const enhancedActions = useEnhancedMovieActions();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (useEnhancedActions) {
      enhancedActions.toggleFavorite(movie.id, movie.isFavourite);
    } else if (onFavoriteToggle) {
      onFavoriteToggle(movie.id);
    }
  };

  const handleWatchlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (useEnhancedActions) {
      enhancedActions.toggleWatchlist(movie.id, movie.isInWatchlist);
    } else if (onWatchlistToggle) {
      onWatchlistToggle(movie.id);
    }
  };

  const handleRatingChange = async (rating: number) => {
    if (useEnhancedActions) {
      enhancedActions.updateRating(movie.id, rating);
    } else if (onRatingUpdate) {
      await onRatingUpdate(movie.id, rating);
    }
  };

  // Get loading states
  const isFavoriteLoading = useEnhancedActions ? enhancedActions.isFavoriteChanging(movie.id) : false;
  const isWatchlistLoading = useEnhancedActions ? enhancedActions.isWatchlistChanging(movie.id) : false;
  const isRatingLoading = useEnhancedActions ? enhancedActions.isRatingChanging(movie.id) : false;

  // Create the movie URL with page parameter if available
  const createMovieUrl = () => {
    if (currentPage) {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      if (pageContext !== 'home') {
        params.set('from', pageContext);
      }
      return `/movie/${movie.id}?${params.toString()}`;
    }
    return `/movie/${movie.id}`;
  };

  const movieUrl = createMovieUrl();

  return (
    <div className={cn(
      "group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden",
      "border border-gray-700 transition-all duration-300 hover:border-gray-600",
      "hover:shadow-2xl hover:scale-105 transform-gpu",
      "animate-fade-in",
      className
    )}>
      {/* Clickable Image Container - Only this part navigates */}
      <Link href={movieUrl} className="block">
        <div className="relative aspect-[16/9] overflow-hidden">
          {imageLoading && (
            <div className="absolute inset-0 skeleton rounded-lg" />
          )}
          
          {!imageError ? (
            <Image
              src={movie.coverUrl}
              alt={movie.title}
              fill
              className={cn(
                "object-cover transition-all duration-300",
                "group-hover:scale-110",
                imageLoading ? "opacity-0" : "opacity-100"
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Play className="w-8 h-8" />
                </div>
                <p className="text-sm">Image not available</p>
              </div>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
            <div className="bg-black/50 backdrop-blur-sm rounded-full p-4 border border-white/20">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </div>

          {/* Movie code badge */}
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/20">
            <span className="text-white text-xs font-medium font-mono">{movie.code}</span>
          </div>
        </div>
      </Link>

      {/* Action buttons - Outside of Link */}
      <div className="absolute top-3 right-3 flex flex-col space-y-2 z-10">
        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className={cn(
            "p-2 rounded-full transition-all duration-300",
            "bg-black/50 backdrop-blur-sm border border-white/20",
            "hover:bg-black/70 hover:scale-110 active:scale-95",
            "opacity-100" // Always visible
          )}
          aria-label={movie.isFavourite ? "Remove from favorites" : "Add to favorites"}
          disabled={isFavoriteLoading}
        >
          {isFavoriteLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Heart
              className={cn(
                "w-4 h-4 transition-colors duration-300",
                movie.isFavourite 
                  ? "text-red-500 fill-red-500" 
                  : "text-white hover:text-red-400"
              )}
            />
          )}
        </button>

        {/* Watchlist button */}
        <button
          onClick={handleWatchlistClick}
          className={cn(
            "p-2 rounded-full transition-all duration-300",
            "bg-black/50 backdrop-blur-sm border border-white/20",
            "hover:bg-black/70 hover:scale-110 active:scale-95",
            "opacity-100" // Always visible
          )}
          aria-label={movie.isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          disabled={isWatchlistLoading}
        >
          {isWatchlistLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Clock
              className={cn(
                "w-4 h-4 transition-colors duration-300",
                movie.isInWatchlist 
                  ? "text-blue-500 fill-blue-500" 
                  : "text-white hover:text-blue-400"
              )}
            />
          )}
        </button>        
      </div>

      {/* Content - Not clickable for navigation */}
      <div className="p-4">
        {/* Rating and year - Interactive rating, non-clickable year */}
        <div className="flex items-center justify-between">
          <RatingComponent
            rating={movie.rating}
            onRatingChange={handleRatingChange}
            size="sm"
            showValue={true}
            readonly={isRatingLoading}
          />
          <span className="text-xs text-gray-500">
            {new Date(movie.publishedAt).getFullYear()}
          </span>
        </div>
      </div>
    </div>
  );
}
