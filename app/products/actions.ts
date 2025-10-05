"use server";

import { ProductService } from '@/lib/services/product.service';
import { ProductFilter } from '@/types/product';

export interface ProductsResponse {
  products: any[];
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  filter: ProductFilter,
  page: number;
  limit: number;
}

/**
 * Fetches products with pagination - Server Action
 */
export async function fetchProducts(params: PaginationParams): Promise<ProductsResponse> {
  try {
    const { page, limit, filter } = params;
    const { brandIds, categoryIds, search, priceRange, sort } = filter;

    const productService = new ProductService();
    
    const result = await productService.getProducts({
      page,
      limit,
      search,
      categoryIds,
      brandIds,
      minPrice: priceRange?.min,
      maxPrice: priceRange?.max,
      sort,
    });

    return {
      products: result.products,
      total: result.total,
      totalPages: result.totalPages,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}
