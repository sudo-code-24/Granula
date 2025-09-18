"use client";

import { useAuth } from './useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function useAuthGuard(requiredRole?: string) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user && !pathname.startsWith('/login')) {
      router.push('/unauthorized');
    }
  }, [user, isLoading, router]);

  // Check if user has required role
  if (user && requiredRole && user.role?.name !== requiredRole) {
    return { user, isLoading, isAuthorized: false };
  }

  return { user, isLoading, isAuthorized: !!user };
}
