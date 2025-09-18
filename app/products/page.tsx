
"use client";

import React, { useEffect, useState } from 'react';
import { SidebarLayout } from '../components/SidebarLayout';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import UnauthorizedAccess from '../components/UnauthorizedAccess';
import { ProductCard } from '../components/Product';
import { Product } from '@/types/product';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useClientSide } from '@/hooks/use-client-side';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ProductAPI } from '@/lib/api/products';

export default function ProductsPage() {
  const isClient = useClientSide();
  const { user, isLoading, isAuthorized } = useAuthGuard();
  const { handleError, handleNetworkError, success } = useErrorHandler();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const productsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await ProductAPI.getProducts({
          page: currentPage,
          limit: productsPerPage,
        });
 
        setProducts(data.products || []);
        setTotalProducts(data.total || 0);
        setTotalPages(data.totalPages || 1);
        
        success('Products loaded successfully', `${data.products?.length || 0} products available`);
      } catch (error) {
        // Handle network/database errors with toast notifications
        handleNetworkError(error, 'Fetching Products');
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthorized) {
      fetchProducts();
    }
  }, [isAuthorized, currentPage, productsPerPage, handleNetworkError, success]);

  // Products are already paginated by the API
  const currentProducts = products;

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Prevent hydration mismatch by not rendering auth-dependent content on server
  if (!isClient) {
    return <LoadingSpinner />;
  }

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthorized) return <UnauthorizedAccess />;
  if (loading) return <LoadingSpinner />;

  return (
    <SidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * productsPerPage) + 1}-{Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} products
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6">
          {/* Top Section - Search Bar and Primary Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-3 pl-12 pr-4 text-sm bg-gray-500/20 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Primary Filter Buttons */}
            <div className="flex gap-3">
              <button className="px-4 py-3 bg-gray-500/20 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors">
                Category
              </button>
              <button className="px-4 py-3 bg-gray-500/20 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2">
                Brand
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="px-4 py-3 bg-gray-500/20 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2">
                Under $50
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom Section - Active Filter Tags */}
          <div className="flex flex-wrap gap-2">
            {/* Category Tag (Orange highlight) */}
            <div className="px-3 py-1 bg-orange-500 text-white text-sm rounded-full flex items-center gap-2">
              <span>Category</span>
              <button className="hover:bg-orange-600 rounded-full p-0.5">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Other Filter Tags */}
            <div className="px-3 py-1 bg-gray-500/20 text-gray-300 text-sm rounded-full flex items-center gap-2">
              <span>Fragrance</span>
              <button className="hover:bg-gray-700 rounded-full p-0.5">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-3 py-1 bg-gray-500/20 text-gray-300 text-sm rounded-full flex items-center gap-2">
              <span>Under</span>
              <button className="hover:bg-gray-700 rounded-full p-0.5">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-3 py-1 bg-gray-500/20 text-gray-300 text-sm rounded-full flex items-center gap-2">
              <span>Price Range</span>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>

            <div className="px-3 py-1 bg-gray-500/20 text-gray-300 text-sm rounded-full flex items-center gap-2">
              <span>Under $50</span>
              <button className="hover:bg-gray-700 rounded-full p-0.5">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination className='mt-6 justify-center'>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePrevious();
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page as number);
                      }}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNext();
                  }}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </SidebarLayout>
  );
}
