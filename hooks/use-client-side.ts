import { useEffect, useState } from 'react';

/**
 * Custom hook to detect if the component is running on the client side.
 * This helps prevent hydration mismatches by ensuring components only render
 * client-dependent content after hydration is complete.
 * 
 * @returns {boolean} true if running on client side, false during SSR
 */
export function useClientSide(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
