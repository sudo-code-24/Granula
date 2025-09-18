"use client";

import React from 'react';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import UnauthorizedAccess from '@/app/components/UnauthorizedAccess';
import { useAuth } from '@/lib/useAuth';
import { useClientSide } from '@/hooks/use-client-side';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ProductAPI } from '@/lib/api/products';
import { Product } from '@/types/product';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const isClient = useClientSide();
  const { user, isLoading, isAuthorized } = useAuthGuard('admin');
  const { logout } = useAuth();
  const { handleError, success } = useErrorHandler();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await ProductAPI.getProducts({ limit: 50 });
        setProducts(data.products);
        success('Products loaded', `${data.products.length} products in database`);
      } catch (error) {
        handleError(error, 'Loading Products');
      } finally {
        setLoading(false);
      }
    };

    if (isClient && isAuthorized) {
      fetchProducts();
    }
  }, [isClient, isAuthorized, handleError, success]);

  if (!isClient) return <LoadingSpinner />;
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthorized) return <UnauthorizedAccess />;

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
            Welcome, {user?.email} (Admin)
          </p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            {/* Products Management Section */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Products Management</h3>
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {product.thumbnail ? (
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={product.thumbnail}
                                    alt={product.title}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500 text-sm">📦</span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {product.brand.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <span className="text-blue-600 font-medium">
                                {product.category.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${product.price.toFixed(2)}
                            {product.discountPercentage > 0 && (
                              <span className="ml-2 text-green-600 text-xs">
                                -{product.discountPercentage}%
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.stock > 10 
                                ? 'bg-green-100 text-green-800' 
                                : product.stock > 0 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.stock} in stock
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <span className="text-yellow-400">⭐</span>
                              <span className="ml-1">{product.rating.toFixed(1)}</span>
                              <span className="ml-1 text-gray-500">({product.reviews.length})</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Other Admin Sections */}
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
