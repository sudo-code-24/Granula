import React from 'react';
import { useClientSide } from '@/hooks/use-client-side';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that only renders its children on the client side.
 * This prevents hydration mismatches for components that depend on client-side state.
 * 
 * @param children - Content to render on client side
 * @param fallback - Optional fallback content to render during SSR
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isClient = useClientSide();

  if (!isClient) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
