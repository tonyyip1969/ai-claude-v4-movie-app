'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Creates a new QueryClient instance with optimized default configuration
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 2 minutes
        staleTime: 2 * 60 * 1000,
        // Cache data for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Retry failed requests twice
        retry: 2,
        // Refetch on window focus for real-time updates
        refetchOnWindowFocus: true,
        // Refetch when reconnecting to network
        refetchOnReconnect: true,
        // Don't refetch on component mount if data is fresh
        refetchOnMount: false,
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Get or create a QueryClient instance for browser environment
 */
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

/**
 * QueryProvider component that provides TanStack Query functionality
 * to the entire application with optimized configuration for movie data
 */
export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
