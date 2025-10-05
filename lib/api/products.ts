import { Product, ProductListResponse } from '@/types/product';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryIds?: number[];
  brandIds?: number[];
  minPrice?: number;
  maxPrice?: number;
}

export class ProductAPI {
  private static baseUrl = '/api/products';

  /**
   * Fetch products with optional filters
   */
  static async getProducts(filters: ProductFilters = {}): Promise<ProductListResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.categoryIds?.length) {
      filters.categoryIds?.forEach(c => params.append("category", c.toString()));
    };
    if (filters.brandIds?.length) {
      filters.brandIds?.forEach(c => params.append("brand", c.toString()));
    };
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());

    const url = `${this.baseUrl}?${params.toString()}`;
    console.log("fetching products ", url);

    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Fetch a single product by ID
   */
  static async getProduct(id: string): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Create a new product
   */
  static async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'reviews'>): Promise<Product> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create product: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Update an existing product
   */
  static async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update product: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Delete a product
   */
  static async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.status}`);
    }
  }

  /**
   * Search products by query
   */
  static async searchProducts(query: string, filters: Omit<ProductFilters, 'search'> = {}): Promise<ProductListResponse> {
    return this.getProducts({ ...filters, search: query });
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(categoryIds: number[], filters: Omit<ProductFilters, 'category'> = {}): Promise<ProductListResponse> {
    return this.getProducts({ ...filters, categoryIds });
  }

  /**
   * Get products by brand
   */
  static async getProductsByBrand(brandIds: number[], filters: Omit<ProductFilters, 'brand'> = {}): Promise<ProductListResponse> {
    return this.getProducts({ ...filters, brandIds });
  }

  /**
   * Get products by price range
   */
  static async getProductsByPriceRange(minPrice: number, maxPrice: number, filters: Omit<ProductFilters, 'minPrice' | 'maxPrice'> = {}): Promise<ProductListResponse> {
    return this.getProducts({ ...filters, minPrice, maxPrice });
  }
}
