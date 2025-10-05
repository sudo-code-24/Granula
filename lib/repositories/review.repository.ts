import { prisma } from '@/lib/database';
import { Review, Prisma } from '@/app/generated/prisma';
import { BaseRepository } from './base.repository';

export interface ReviewWithProduct extends Review {
  product: {
    id: number;
    title: string;
    slug: string;
    thumbnail?: string;
  };
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  recentReviews: ReviewWithProduct[];
}

export interface CreateReviewData {
  productId: number;
  rating: number;
  comment?: string;
  author?: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
  author?: string;
}

export interface ReviewFilters {
  productId?: number;
  rating?: number;
  author?: string;
  page?: number;
  limit?: number;
  orderBy?: any;
}

export class ReviewRepository extends BaseRepository<
  Review,
  Prisma.ReviewCreateInput,
  Prisma.ReviewUpdateInput
> {
  constructor() {
    super(prisma.review);
  }

  /**
   * Find reviews by product ID
   */
  async findByProductId(productId: number, options: {
    page?: number;
    limit?: number;
    orderBy?: any;
  } = {}): Promise<{ reviews: ReviewWithProduct[]; total: number; totalPages: number }> {
    const { page = 1, limit = 10, orderBy = { createdAt: 'desc' } } = options;
    const skip = (page - 1) * limit;

    const { records: reviews, total } = await this.findManyWithCount({
      where: { productId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    return {
      reviews,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find reviews by author
   */
  async findByAuthor(author: string, options: {
    page?: number;
    limit?: number;
    orderBy?: any;
  } = {}): Promise<{ reviews: ReviewWithProduct[]; total: number; totalPages: number }> {
    const { page = 1, limit = 10, orderBy = { createdAt: 'desc' } } = options;
    const skip = (page - 1) * limit;

    const { records: reviews, total } = await this.findManyWithCount({
      where: { author },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    return {
      reviews,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find reviews by rating
   */
  async findByRating(rating: number, options: {
    page?: number;
    limit?: number;
    orderBy?: any;
  } = {}): Promise<{ reviews: ReviewWithProduct[]; total: number; totalPages: number }> {
    const { page = 1, limit = 10, orderBy = { createdAt: 'desc' } } = options;
    const skip = (page - 1) * limit;

    const { records: reviews, total } = await this.findManyWithCount({
      where: { rating },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    return {
      reviews,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get recent reviews
   */
  async findRecent(limit: number = 10): Promise<ReviewWithProduct[]> {
    return this.findMany({
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get review statistics for a product
   */
  async getProductStats(productId: number): Promise<ReviewStats> {
    const [reviews, ratingDistribution] = await Promise.all([
      this.findByProductId(productId, { limit: 1000 }), // Get all reviews for stats
      prisma.review.groupBy({
        by: ['rating'],
        where: { productId },
        _count: {
          rating: true,
        },
        orderBy: {
          rating: 'asc',
        },
      }),
    ]);

    const totalReviews = reviews.total;
    const averageRating = totalReviews > 0 
      ? reviews.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    const ratingDist = ratingDistribution.map(item => ({
      rating: item.rating,
      count: item._count.rating,
      percentage: totalReviews > 0 ? (item._count.rating / totalReviews) * 100 : 0,
    }));

    // Get recent reviews (last 5)
    const recentReviews = await this.findRecent(5);

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      ratingDistribution: ratingDist,
      recentReviews,
    };
  }

  /**
   * Get overall review statistics
   */
  async getOverallStats(): Promise<{
    totalReviews: number;
    averageRating: number;
    totalProducts: number;
    productsWithReviews: number;
  }> {
    const [totalReviews, averageRating, totalProducts, productsWithReviews] = await Promise.all([
      this.count(),
      prisma.review.aggregate({
        _avg: {
          rating: true,
        },
      }).then(result => result._avg.rating || 0),
      prisma.product.count(),
      prisma.product.count({
        where: {
          reviews: {
            some: {},
          },
        },
      }),
    ]);

    return {
      totalReviews,
      averageRating: Math.round((averageRating || 0) * 10) / 10,
      totalProducts,
      productsWithReviews,
    };
  }

  /**
   * Search reviews
   */
  async search(query: string, options: {
    page?: number;
    limit?: number;
    productId?: number;
    rating?: number;
  } = {}): Promise<{ reviews: ReviewWithProduct[]; total: number; totalPages: number }> {
    const { page = 1, limit = 10, productId, rating } = options;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { comment: { contains: query, mode: 'insensitive' } },
        { author: { contains: query, mode: 'insensitive' } },
        { product: { title: { contains: query, mode: 'insensitive' } } },
      ],
    };

    if (productId) {
      where.productId = productId;
    }

    if (rating) {
      where.rating = rating;
    }

    const { records: reviews, total } = await this.findManyWithCount({
      where,
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return {
      reviews,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get reviews with filters
   */
  async findWithFilters(filters: ReviewFilters): Promise<{ reviews: ReviewWithProduct[]; total: number; totalPages: number }> {
    const { 
      productId, 
      rating, 
      author, 
      page = 1, 
      limit = 10, 
      orderBy = { createdAt: 'desc' } 
    } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (productId) where.productId = productId;
    if (rating) where.rating = rating;
    if (author) where.author = { contains: author, mode: 'insensitive' };

    const { records: reviews, total } = await this.findManyWithCount({
      where,
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    return {
      reviews,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get top rated products
   */
  async getTopRatedProducts(limit: number = 10): Promise<{
    productId: number;
    product: {
      id: number;
      title: string;
      slug: string;
      thumbnail?: string;
    };
    averageRating: number;
    reviewCount: number;
  }[]> {
    const result = await prisma.review.groupBy({
      by: ['productId'],
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
      orderBy: {
        _avg: {
          rating: 'desc',
        },
      },
      take: limit,
    });

    // Get product details for each result
    const productsWithDetails = await Promise.all(
      result.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
          },
        });

        return {
          productId: item.productId,
          product: {
            ...product!,
            thumbnail: product!.thumbnail || undefined,
          },
          averageRating: Math.round((item._avg.rating || 0) * 10) / 10,
          reviewCount: item._count.rating,
        };
      })
    );

    return productsWithDetails;
  }

  /**
   * Get most reviewed products
   */
  async getMostReviewedProducts(limit: number = 10): Promise<{
    productId: number;
    product: {
      id: number;
      title: string;
      slug: string;
      thumbnail?: string;
    };
    reviewCount: number;
    averageRating: number;
  }[]> {
    const result = await prisma.review.groupBy({
      by: ['productId'],
      _count: {
        rating: true,
      },
      _avg: {
        rating: true,
      },
      orderBy: {
        _count: {
          rating: 'desc',
        },
      },
      take: limit,
    });

    // Get product details for each result
    const productsWithDetails = await Promise.all(
      result.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
          },
        });

        return {
          productId: item.productId,
          product: {
            ...product!,
            thumbnail: product!.thumbnail || undefined,
          },
          reviewCount: item._count.rating,
          averageRating: Math.round((item._avg.rating || 0) * 10) / 10,
        };
      })
    );

    return productsWithDetails;
  }

  /**
   * Check if user has reviewed product
   */
  async hasUserReviewedProduct(productId: number, author: string): Promise<boolean> {
    return this.exists({
      productId,
      author,
    });
  }

  /**
   * Get user's review for a product
   */
  async getUserReviewForProduct(productId: number, author: string): Promise<ReviewWithProduct | null> {
    const reviews = await this.findMany({
      where: {
        productId,
        author,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
          },
        },
      },
      take: 1,
    });

    return reviews[0] || null;
  }

  /**
   * Delete reviews for a product
   */
  async deleteByProductId(productId: number): Promise<number> {
    const result = await this.deleteMany({
      where: { productId },
    });

    return result.count;
  }

  /**
   * Delete reviews by author
   */
  async deleteByAuthor(author: string): Promise<number> {
    const result = await this.deleteMany({
      where: { author },
    });

    return result.count;
  }

  /**
   * Get review by ID with product
   */
  async findByIdWithProduct(id: number): Promise<ReviewWithProduct | null> {
    const reviews = await this.findMany({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
          },
        },
      },
      take: 1,
    });

    return reviews[0] || null;
  }
}
