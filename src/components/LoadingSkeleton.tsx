'use client';

import { cn } from '@/lib/utils';
import { useSettings } from '@/hooks/useSettings';

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
      <div className="aspect-[16/9] bg-gray-700 skeleton" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Rating */}
        <div className="flex justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-20 bg-gray-700 rounded skeleton" />
            <div className="h-4 w-8 bg-gray-700 rounded skeleton" />
          </div>
          <div className="h-4 w-8 bg-gray-700 rounded skeleton" />
        </div>
      </div>
    </div>
  );
}

export function MovieGridSkeleton({ count, className }: LoadingSkeletonProps) {
  const { settings } = useSettings();
  const itemCount = count || (settings.gridColumns * settings.gridRows);
  
  return (
    <div 
      className={cn("grid gap-6", className)}
      style={{
        gridTemplateColumns: `repeat(${settings.gridColumns}, 1fr)`
      }}
    >
      {Array.from({ length: itemCount }).map((_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function SearchSkeleton({ className }: { className?: string }) {
  const { settings } = useSettings();
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Search header skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-48 bg-gray-700 rounded skeleton" />
        <div className="h-4 w-32 bg-gray-700 rounded skeleton" />
      </div>
      
      {/* Results grid skeleton */}
      <MovieGridSkeleton count={settings.gridColumns * 3} />
    </div>
  );
}

export function MovieDetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("min-h-screen", className)}>
      {/* Background skeleton */}
      <div className="fixed inset-0 z-0 bg-gray-900" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Navigation Header */}
        <div className="flex items-center justify-between px-4 py-6">
          <div className="h-10 w-20 bg-gray-700 rounded-lg skeleton" />
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12 px-4 pb-6">
          {/* Left Side - Movie Poster and Actions */}
          <div className="flex-[2] space-y-6">
            {/* Poster skeleton */}
            <div className="relative w-full aspect-[16/9] rounded-xl bg-gray-700 skeleton" />

            {/* Action Buttons skeleton */}
            <div className="flex flex-col gap-4">
              <div className="h-12 bg-gray-700 rounded-lg skeleton" />
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="h-12 flex-1 bg-gray-700 rounded-lg skeleton" />
                <div className="h-12 flex-1 bg-gray-700 rounded-lg skeleton" />
              </div>
            </div>

            {/* Rating section skeleton */}
            <div className="space-y-3">
              <div className="h-6 w-40 bg-gray-700 rounded skeleton" />
              <div className="space-y-2">
                <div className="h-8 w-48 bg-gray-700 rounded skeleton" />
                <div className="h-4 w-32 bg-gray-700 rounded skeleton" />
                <div className="h-3 w-56 bg-gray-700 rounded skeleton" />
              </div>
            </div>
          </div>

          {/* Right Side - Movie Information */}
          <div className="flex-1 space-y-6">
            {/* Title and Meta skeleton */}
            <div className="space-y-4">
              <div className="h-12 bg-gray-700 rounded skeleton" />
              <div className="h-8 w-3/4 bg-gray-700 rounded skeleton" />
              
              {/* Rating and Year skeleton */}
              <div className="flex items-center space-x-4">
                <div className="h-6 w-16 bg-gray-700 rounded skeleton" />
                <div className="h-6 w-12 bg-gray-700 rounded skeleton" />
                <div className="h-6 w-20 bg-gray-700 rounded skeleton" />
              </div>
            </div>

            {/* Description skeleton */}
            <div className="space-y-3">
              <div className="h-6 w-32 bg-gray-700 rounded skeleton" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded skeleton" />
                <div className="h-4 bg-gray-700 rounded skeleton" />
                <div className="h-4 bg-gray-700 rounded skeleton" />
                <div className="h-4 w-3/4 bg-gray-700 rounded skeleton" />
              </div>
            </div>

            {/* Movie Details Grid skeleton */}
            <div className="space-y-3">
              <div className="h-6 w-36 bg-gray-700 rounded skeleton" />
              <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-4 bg-gray-700 rounded skeleton" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
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
