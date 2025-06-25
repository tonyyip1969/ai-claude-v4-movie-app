'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingComponentProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export default function RatingComponent({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md',
  showValue = true,
  className
}: RatingComponentProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const handleStarClick = async (starRating: number) => {
    if (readonly || isUpdating) return;

    setIsUpdating(true);
    try {
      if (onRatingChange) {
        await onRatingChange(starRating);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (!readonly) {
      setHoverRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;
  const fullStars = Math.floor(displayRating / 2);
  const hasHalfStar = displayRating % 2 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <div 
        className="flex items-center space-x-0.5"
        onMouseLeave={handleMouseLeave}
      >
        {/* Full Stars */}
        {[...Array(fullStars)].map((_, i) => (
          <button
            key={`full-${i}`}
            onClick={() => handleStarClick((i + 1) * 2)}
            onMouseEnter={() => handleStarHover((i + 1) * 2)}
            disabled={readonly || isUpdating}
            className={cn(
              sizeClasses[size],
              "transition-all duration-200",
              !readonly && "cursor-pointer hover:scale-110",
              readonly && "cursor-default",
              isUpdating && "opacity-50"
            )}
          >
            <Star 
              className={cn(
                "w-full h-full fill-yellow-400 text-yellow-400",
                hoverRating && hoverRating >= (i + 1) * 2 && !readonly && "fill-yellow-300 text-yellow-300"
              )} 
            />
          </button>
        ))}

        {/* Half Star */}
        {hasHalfStar && (
          <button
            onClick={() => handleStarClick(fullStars * 2 + 1)}
            onMouseEnter={() => handleStarHover(fullStars * 2 + 1)}
            disabled={readonly || isUpdating}
            className={cn(
              sizeClasses[size],
              "transition-all duration-200",
              !readonly && "cursor-pointer hover:scale-110",
              readonly && "cursor-default",
              isUpdating && "opacity-50"
            )}
          >
            <Star 
              className={cn(
                "w-full h-full fill-yellow-400/50 text-yellow-400",
                hoverRating && hoverRating >= fullStars * 2 + 1 && !readonly && "fill-yellow-300 text-yellow-300"
              )} 
            />
          </button>
        )}

        {/* Empty Stars */}
        {[...Array(emptyStars)].map((_, i) => {
          const starValue = (fullStars + (hasHalfStar ? 1 : 0) + i + 1) * 2;
          return (
            <button
              key={`empty-${i}`}
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => handleStarHover(starValue)}
              disabled={readonly || isUpdating}
              className={cn(
                sizeClasses[size],
                "transition-all duration-200",
                !readonly && "cursor-pointer hover:scale-110",
                readonly && "cursor-default",
                isUpdating && "opacity-50"
              )}
            >
              <Star 
                className={cn(
                  "w-full h-full text-gray-600",
                  hoverRating && hoverRating >= starValue && !readonly && "fill-yellow-300 text-yellow-300"
                )} 
              />
            </button>
          );
        })}
      </div>

      {/* Rating Value */}
      {showValue && (
        <span className={cn(
          "text-gray-400 ml-2",
          textSizeClasses[size],
          isUpdating && "opacity-50"
        )}>
          {isUpdating ? 'Updating...' : `(${displayRating}/10)`}
        </span>
      )}

      {/* Interactive hint */}
      {!readonly && !isUpdating && (
        <span className={cn(
          "text-gray-500 ml-1",
          textSizeClasses[size],
          hoverRating ? "opacity-100" : "opacity-0",
          "transition-opacity duration-200"
        )}>
          {hoverRating ? `Rate ${hoverRating}/10` : ''}
        </span>
      )}
    </div>
  );
}
