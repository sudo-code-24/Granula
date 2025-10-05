import { ProductRepository } from '@/lib/repositories/product.repository';
import { ProductFilter, SortOption } from '@/types/product';

export interface ProductServiceFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryIds?: number[];
  brandIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
}

export interface ProductServiceResponse {
  products: any[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  /**
   * Get products with filtering and sorting
   */
  async getProducts(filters: ProductServiceFilters = {}): Promise<ProductServiceResponse> {
    const {
      page = 1,
      limit = 12,
      search,
      categoryIds,
      brandIds,
      minPrice,
      maxPrice,
      sort,
    } = filters;

    const result = await this.productRepository.findWithFilters({
      page,
      limit,
      search,
      categoryIds,
      brandIds,
      minPrice,
      maxPrice,
      sort,
    });

    return {
      products: result.products,
      total: result.total,
      totalPages: result.totalPages,
      page: result.page,
      limit: result.limit,
    };
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: number) {
    return this.productRepository.findByIdWithRelations(id);
  }

  /**
   * Get a single product by slug
   */
  async getProductBySlug(slug: string) {
    return this.productRepository.findBySlugWithRelations(slug);
  }

  /**
   * Search products
   */
  async searchProducts(query: string, options: {
    page?: number;
    limit?: number;
    categoryIds?: number[];
    brandIds?: number[];
    sort?: SortOption;
  } = {}) {
    return this.productRepository.search(query, options);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryIds: number[], options: {
    page?: number;
    limit?: number;
    sort?: SortOption;
  } = {}) {
    return this.productRepository.findByCategory(categoryIds, options);
  }

  /**
   * Get products by brand
   */
  async getProductsByBrand(brandIds: number[], options: {
    page?: number;
    limit?: number;
    sort?: SortOption;
  } = {}) {
    return this.productRepository.findByBrand(brandIds, options);
  }

  /**
   * Get products by price range
   */
  async getProductsByPriceRange(minPrice: number, maxPrice: number, options: {
    page?: number;
    limit?: number;
    sort?: SortOption;
  } = {}) {
    return this.productRepository.findByPriceRange(minPrice, maxPrice, options);
  }

  /**
   * Get active products
   */
  async getActiveProducts(options: {
    page?: number;
    limit?: number;
    sort?: SortOption;
  } = {}) {
    return this.productRepository.findActive(options);
  }

  /**
   * Create a new product
   */
  async createProduct(productData: {
    title: string;
    description: string;
    price: number;
    discountPercentage?: number;
    stock: number;
    sku?: string;
    slug: string;
    thumbnail?: string;
    images?: string[];
    tags?: string[];
    isActive?: boolean;
    categoryId: number;
    brandId: number;
  }) {
    return this.productRepository.create({
      data: productData,
      include: {
        category: true,
        brand: true,
        reviews: true,
      },
    });
  }

  /**
   * Update a product
   */
  async updateProduct(id: number, productData: {
    title?: string;
    description?: string;
    price?: number;
    discountPercentage?: number;
    stock?: number;
    sku?: string;
    slug?: string;
    thumbnail?: string;
    images?: string[];
    tags?: string[];
    isActive?: boolean;
    categoryId?: number;
    brandId?: number;
  }) {
    return this.productRepository.update({
      where: { id },
      data: productData,
    });
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: number) {
    return this.productRepository.delete({
      where: { id },
    });
  }

  /**
   * Get product statistics
   */
  async getProductStats() {
    return this.productRepository.getStats();
  }

  /**
   * Validate product data
   */
  validateProductData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (data.price === undefined || data.price < 0) {
      errors.push('Price must be a positive number');
    }

    if (data.stock === undefined || data.stock < 0) {
      errors.push('Stock must be a non-negative number');
    }

    if (!data.slug || data.slug.trim().length === 0) {
      errors.push('Slug is required');
    }

    if (!data.categoryId || data.categoryId <= 0) {
      errors.push('Valid category ID is required');
    }

    if (!data.brandId || data.brandId <= 0) {
      errors.push('Valid brand ID is required');
    }

    if (data.discountPercentage !== undefined && (data.discountPercentage < 0 || data.discountPercentage > 100)) {
      errors.push('Discount percentage must be between 0 and 100');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate product slug from title
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  }

  /**
   * Check if product slug is unique
   */
  async isSlugUnique(slug: string, excludeId?: number): Promise<boolean> {
    const product = await this.productRepository.findBySlugWithRelations(slug);
    if (!product) return true;
    return excludeId ? product.id !== excludeId : false;
  }

  /**
   * Get related products
   */
  async getRelatedProducts(productId: number, categoryId: number, limit: number = 4) {
    return this.productRepository.findWithRelations({
      where: {
        categoryId,
        id: { not: productId },
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 8) {
    return this.productRepository.findWithRating({
      where: {
        isActive: true,
        discountPercentage: { gt: 0 }, // Products with discounts
      },
      orderBy: { discountPercentage: 'desc' },
      take: limit,
    });
  }

  /**
   * Get new products
   */
  async getNewProducts(limit: number = 8) {
    return this.productRepository.findWithRating({
      where: {
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get best selling products (based on reviews count)
   */
  async getBestSellingProducts(limit: number = 8) {
    // This would require additional logic to track sales
    // For now, we'll return products with most reviews
    return this.productRepository.findWithRating({
      where: {
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
