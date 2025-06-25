'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Play, Star } from 'lucide-react';
import { Movie } from '@/types/movie';
import { cn, truncateText } from '@/lib/utils';

interface MovieCardProps {
  movie: Movie;
  onFavoriteToggle?: (id: number) => void;
  className?: string;
}

export default function MovieCard({ movie, onFavoriteToggle, className }: MovieCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onFavoriteToggle) {
      onFavoriteToggle(movie.id);
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = rating % 2 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center space-x-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <Star className="w-3 h-3 fill-yellow-400/50 text-yellow-400" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-3 h-3 text-gray-600" />
        ))}
        <span className="text-xs text-gray-400 ml-1">({rating}/10)</span>
      </div>
    );
  };

  return (
    <div className={cn(
      "group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden",
      "border border-gray-700 transition-all duration-300 hover:border-gray-600",
      "hover:shadow-2xl hover:scale-105 transform-gpu",
      "animate-fade-in",
      className
    )}>
      <Link href={`/movie/${movie.id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[2/3] overflow-hidden">
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

          {/* Favorite button */}
          <button
            onClick={handleFavoriteClick}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full transition-all duration-300",
              "bg-black/50 backdrop-blur-sm border border-white/20",
              "hover:bg-black/70 hover:scale-110 active:scale-95",
              "opacity-0 group-hover:opacity-100"
            )}
            aria-label={movie.isFavourite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors duration-300",
                movie.isFavourite 
                  ? "text-red-500 fill-red-500" 
                  : "text-white hover:text-red-400"
              )}
            />
          </button>

          {/* Rating badge */}
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/20">
            <span className="text-white text-xs font-medium">{movie.rating}/10</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-white text-lg leading-tight mb-1 line-clamp-1">
              {movie.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
              {truncateText(movie.description, 80)}
            </p>
          </div>

          {/* Rating stars */}
          <div className="flex items-center justify-between">
            {renderStars(movie.rating)}
            <span className="text-xs text-gray-500">
              {new Date(movie.publishedAt).getFullYear()}
            </span>
          </div>

          {/* Movie code */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <span className="text-xs text-gray-500 font-mono">{movie.code}</span>
            {movie.isFavourite && (
              <div className="flex items-center space-x-1 text-red-400">
                <Heart className="w-3 h-3 fill-current" />
                <span className="text-xs">Favorite</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
