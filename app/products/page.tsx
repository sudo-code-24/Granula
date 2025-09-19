
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
import { fetchProducts } from './actions';
import { paginationUtils } from '../../lib/pagination-utils';
import ProductFilter from '../components/Product/ProductFilter';

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
    const loadProducts = async () => {
      try {
        const data = await fetchProducts({
          page: currentPage,
          limit: productsPerPage,
        });

        setProducts(data.products);
        setTotalProducts(data.total);
        setTotalPages(data.totalPages);

        success('Products loaded successfully', `${data.products.length} products available`);
      } catch (error) {
        // Handle network/database errors with toast notifications
        handleNetworkError(error, 'Fetching Products');
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthorized) {
      loadProducts();
    }
  }, [isAuthorized, currentPage, productsPerPage, handleNetworkError, success]);

  // Products are already paginated by the API
  const currentProducts = products;

  // Pagination handlers
  const handlePageChange = (page: number) => {
    paginationUtils.handlePageChange(page, setCurrentPage);
  };

  const handlePrevious = () => {
    paginationUtils.handlePrevious(currentPage, totalPages, setCurrentPage);
  };

  const handleNext = () => {
    paginationUtils.handleNext(currentPage, totalPages, setCurrentPage);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    return paginationUtils.getPageNumbers(currentPage, totalPages);
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

        <ProductFilter />

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
