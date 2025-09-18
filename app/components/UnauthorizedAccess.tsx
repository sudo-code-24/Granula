"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function UnauthorizedAccess() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-destructive mb-4">
          Access Denied
        </h1>
        <p className="text-gray-600 mb-4">
          Please log in to access this page.
        </p>
        <Button onClick={() => { router.push('/login') }} className="w-full hover:scale-105 transition-transform">
          Sign In
        </Button>
      </div>
    </div>
  );
}
