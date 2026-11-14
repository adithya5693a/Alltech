import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';

export interface QueryProviderProps {
  children: ReactNode;
}

/**
 * React Query Provider Wrapper.
 * Provides the application or any sub-tree with the configured queryClient.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
