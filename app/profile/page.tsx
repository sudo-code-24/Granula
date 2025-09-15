"use client";

import React from 'react';
import { useAuth } from '@/lib/useAuth';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { SidebarLayout } from '@/app/components/SidebarLayout';

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            Please log in to access your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarLayout>

      <div className="min-h-screen bg-gray-100">
        <div className="py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                Profile
              </h1>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>

                {user.role && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{user.role.name}</p>
                  </div>
                )}

                {user.profile && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Profile Information
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      <pre className="bg-gray-50 p-3 rounded">
                        {JSON.stringify(user.profile, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}