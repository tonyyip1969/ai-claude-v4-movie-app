'use client';

import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export function MovieCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      "bg-gray-800 border border-gray-700 rounded-xl overflow-hidden animate-pulse",
      className
    )}>
      {/* Image skeleton */}
      <div className="aspect-[2/3] bg-gray-700 skeleton" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-gray-700 rounded skeleton" />
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-700 rounded skeleton" />
          <div className="h-3 bg-gray-700 rounded w-3/4 skeleton" />
        </div>
        
        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="h-4 w-20 bg-gray-700 rounded skeleton" />
          <div className="h-4 w-12 bg-gray-700 rounded skeleton" />
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
          <div className="h-3 w-16 bg-gray-700 rounded skeleton" />
          <div className="h-3 w-12 bg-gray-700 rounded skeleton" />
        </div>
      </div>
    </div>
  );
}

export function MovieGridSkeleton({ count = 20, className }: LoadingSkeletonProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6",
      className
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function SearchSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Search header skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-48 bg-gray-700 rounded skeleton" />
        <div className="h-4 w-32 bg-gray-700 rounded skeleton" />
      </div>
      
      {/* Results grid skeleton */}
      <MovieGridSkeleton count={12} />
    </div>
  );
}

export function MovieDetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Hero section skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Poster */}
        <div className="lg:col-span-1">
          <div className="aspect-[2/3] bg-gray-700 rounded-xl skeleton" />
        </div>
        
        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="h-8 bg-gray-700 rounded skeleton" />
            <div className="h-4 w-24 bg-gray-700 rounded skeleton" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded skeleton" />
              <div className="h-4 bg-gray-700 rounded skeleton" />
              <div className="h-4 bg-gray-700 rounded w-3/4 skeleton" />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="h-12 w-32 bg-gray-700 rounded-lg skeleton" />
            <div className="h-12 w-12 bg-gray-700 rounded-lg skeleton" />
          </div>
        </div>
      </div>
      
      {/* Video player skeleton */}
      <div className="aspect-video bg-gray-700 rounded-xl skeleton" />
    </div>
  );
}

export default function LoadingSkeleton({ className, count = 1 }: LoadingSkeletonProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-gray-700 rounded skeleton h-4 mb-2" />
      ))}
    </div>
  );
}
