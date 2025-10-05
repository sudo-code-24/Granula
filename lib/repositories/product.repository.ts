import { prisma } from '@/lib/database';
import { Product, Prisma } from '@/app/generated/prisma';
import { BaseRepository } from './base.repository';
import { ProductFilter, SortOption } from '@/types/product';

export interface ProductWithRelations extends Product {
  category: {
    id: number;
    name: string;
    description?: string;
    slug: string;
    image?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  brand: {
    id: number;
    name: string;
    description?: string;
    logo?: string;
    website?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  reviews: {
    id: number;
    rating: number;
    comment?: string;
    author?: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

export interface ProductWithRating extends ProductWithRelations {
  rating: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryIds?: number[];
  brandIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
}

export class ProductRepository extends BaseRepository<
  Product,
  Prisma.ProductCreateInput,
  Prisma.ProductUpdateInput
> {
  constructor() {
    super(prisma.product);
  }

  /**
   * Get products with full relations (category, brand, reviews)
   */
  async findWithRelations(options: {
    where?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
  }): Promise<ProductWithRelations[]> {
    const { where, orderBy, skip, take } = options;

    return this.findMany({
      where,
      include: {
        category: true,
        brand: true,
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            author: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy,
      skip,
      take,
    });
  }

  /**
   * Get products with relations and calculated average rating
   */
  async findWithRating(options: {
    where?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
  }): Promise<ProductWithRating[]> {
    const products = await this.findWithRelations(options);
    
    return products.map(product => ({
      ...product,
      rating: product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
    }));
  }

  /**
   * Get products with pagination and filtering
   */
  async findWithFilters(filters: ProductFilters) {
    const { page = 1, limit = 12, search, categoryIds, brandIds, minPrice, maxPrice, sort } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = this.buildWhereClause({
      search,
      categoryIds,
      brandIds,
      minPrice,
      maxPrice,
    });

    // Build orderBy clause
    const orderBy = this.buildOrderByClause(sort);

    // Get products with relations and rating
    const products = await this.findWithRating({
      where,
      orderBy,
      skip,
      take: limit,
    });

    // Get total count
    const total = await this.count({ where });

    // Apply post-processing sorting for calculated values
    const sortedProducts = this.applyPostProcessingSort(products, sort);

    return {
      products: sortedProducts,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    };
  }

  /**
   * Get a single product by ID with relations
   */
  async findByIdWithRelations(id: number): Promise<ProductWithRelations | null> {
    const products = await this.findWithRelations({
      where: { id },
      take: 1,
    });

    return products[0] || null;
  }

  /**
   * Get a single product by slug with relations
   */
  async findBySlugWithRelations(slug: string): Promise<ProductWithRelations | null> {
    const products = await this.findWithRelations({
      where: { slug },
      take: 1,
    });

    return products[0] || null;
  }

  /**
   * Search products by query
   */
  async search(query: string, options: {
    page?: number;
    limit?: number;
    categoryIds?: number[];
    brandIds?: number[];
    sort?: SortOption;
  } = {}) {
    const { page = 1, limit = 12, categoryIds, brandIds, sort } = options;

    return this.findWithFilters({
      page,
      limit,
      search: query,
      categoryIds,
      brandIds,
      sort,
    });
  }

  /**
   * Get products by category
   */
  async findByCategory(categoryIds: number[], options: {
    page?: number;
    limit?: number;
    sort?: SortOption;
  } = {}) {
    const { page = 1, limit = 12, sort } = options;

    return this.findWithFilters({
      page,
      limit,
      categoryIds,
      sort,
    });
  }

  /**
   * Get products by brand
   */
  async findByBrand(brandIds: number[], options: {
    page?: number;
    limit?: number;
    sort?: SortOption;
  } = {}) {
    const { page = 1, limit = 12, sort } = options;

    return this.findWithFilters({
      page,
      limit,
      brandIds,
      sort,
    });
  }

  /**
   * Get products by price range
   */
  async findByPriceRange(minPrice: number, maxPrice: number, options: {
    page?: number;
    limit?: number;
    sort?: SortOption;
  } = {}) {
    const { page = 1, limit = 12, sort } = options;

    return this.findWithFilters({
      page,
      limit,
      minPrice,
      maxPrice,
      sort,
    });
  }

  /**
   * Get featured/active products
   */
  async findActive(options: {
    page?: number;
    limit?: number;
    sort?: SortOption;
  } = {}) {
    const { page = 1, limit = 12, sort } = options;

    return this.findWithFilters({
      page,
      limit,
      sort,
    });
  }

  /**
   * Build where clause for filtering
   */
  private buildWhereClause(filters: {
    search?: string;
    categoryIds?: number[];
    brandIds?: number[];
    minPrice?: number;
    maxPrice?: number;
  }) {
    const { search, categoryIds, brandIds, minPrice, maxPrice } = filters;
    const where: any = {};

    // Search in title, description, brand name, and category name
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Filter by categories
    if (categoryIds?.length) {
      where.category = { id: { in: categoryIds } };
    }

    // Filter by brands
    if (brandIds?.length) {
      where.brand = { id: { in: brandIds } };
    }

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Only active products
    where.isActive = true;

    return where;
  }

  /**
   * Build orderBy clause for sorting
   */
  private buildOrderByClause(sort?: SortOption) {
    switch (sort) {
      case 'price_asc':
        return { price: 'asc' };
      case 'price_desc':
        return { price: 'desc' };
      case 'newest':
        return { createdAt: 'desc' };
      case 'oldest':
        return { createdAt: 'asc' };
      case 'rating_asc':
      case 'popular':
        // These require post-processing, so we'll use default order
        return { createdAt: 'desc' };
      default:
        return { createdAt: 'desc' };
    }
  }

  /**
   * Apply post-processing sorting for calculated values
   */
  private applyPostProcessingSort(products: ProductWithRating[], sort?: SortOption): ProductWithRating[] {
    if (!sort) return products;

    switch (sort) {
      case 'rating_asc':
        return [...products].sort((a, b) => a.rating - b.rating);
      case 'popular':
        return [...products].sort((a, b) => b.reviews.length - a.reviews.length);
      default:
        return products;
    }
  }

  /**
   * Get product statistics
   */
  async getStats() {
    const [total, active, inactive] = await Promise.all([
      this.count(),
      this.count({ where: { isActive: true } }),
      this.count({ where: { isActive: false } }),
    ]);

    return {
      total,
      active,
      inactive,
    };
  }
}
