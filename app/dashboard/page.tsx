import React from 'react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Dashboard Dashboard
          </h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Dashboard Content
                </h3>
                <p className="text-gray-500">
                  Add your dashboard components and widgets here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}