"use client";

import React from 'react';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { LoadingSpinner } from './LoadingSpinner';
import UnauthorizedAccess from './UnauthorizedAccess';

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthGuardedComponent(props: P) {
    const { user, isLoading, isAuthorized } = useAuthGuard();

    if (isLoading) return <LoadingSpinner />;
    if (!isAuthorized) return <UnauthorizedAccess />;
    
    return <Component {...props} />;
  };
}

export function withAdminAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AdminAuthGuardedComponent(props: P) {
    const { user, isLoading, isAuthorized } = useAuthGuard('admin');

    if (isLoading) return <LoadingSpinner />;
    if (!isAuthorized) return <UnauthorizedAccess />;
    
    return <Component {...props} />;
  };
}
