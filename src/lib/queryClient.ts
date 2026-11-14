import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { handleApiError } from './errorHandler';

/**
 * Global QueryClient configured for AstroCare flight telemetry.
 * Automatically catches and maps errors into the centralized onError handler.
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      handleApiError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      handleApiError(error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        // Do not retry client 4xx errors
        if (typeof error === 'object' && error !== null && 'status' in error) {
          const status = (error as { status: number }).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
