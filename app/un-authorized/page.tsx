'use client';
import React from 'react';
import Custom_Button from '../components/Custom_Button';
import { useRouter } from 'next/navigation';

export default function UnAuthorizedPage() {
  const rounter = useRouter()
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Access Denied
        </h1>
        <Custom_Button
          variant="primary"
          className='w-full'
          type='button'
          size="lg"
          onClick={() => { rounter.push('/login') }}
        >
          {'Sign In'}
        </Custom_Button>
      </div>
    </div>
  );
}
