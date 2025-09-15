"use client";

import React from 'react';
import { useAuth } from '@/lib/useAuth';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';

export default function AdminPage() {
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
            Please log in to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  // Check if user has admin role
  if (user.role?.name !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-4">
            Access Forbidden
          </h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the admin panel.
          </p>
          <p className="text-sm text-gray-500">
            Your role: {user.role?.name || 'No role assigned'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Admin Panel
            </h1>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Welcome, {user.email} (Admin)
          </p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  User Management
                </h3>
                <p className="text-gray-500">
                  Manage users, roles, and permissions.
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  System Settings
                </h3>
                <p className="text-gray-500">
                  Configure system-wide settings.
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Analytics
                </h3>
                <p className="text-gray-500">
                  View system analytics and reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
