"use server";

import { prisma } from '@/lib/database';
import { Product } from '@/types/product';

export interface ProductsResponse {
  products: Product[];
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Fetches products with pagination - Server Action
 */
export async function fetchProducts(params: PaginationParams): Promise<ProductsResponse> {
  try {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    // Get products with pagination directly from database
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.product.count(),
    ]);

    // Calculate average rating for each product and transform to match Product type
    const productsWithRating: Product[] = products.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      discountPercentage: product.discountPercentage,
      rating: product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
      stock: product.stock,
      sku: product.sku ?? undefined,
      slug: product.slug,
      thumbnail: product.thumbnail ?? undefined,
      images: product.images,
      tags: product.tags,
      isActive: product.isActive,
      categoryId: product.categoryId,
      brandId: product.brandId,
      category: {
        id: product.category.id,
        name: product.category.name,
        description: product.category.description ?? undefined,
        slug: product.category.slug,
        image: product.category.image ?? undefined,
        isActive: product.category.isActive,
        createdAt: product.category.createdAt.toISOString(),
        updatedAt: product.category.updatedAt.toISOString(),
      },
      brand: {
        id: product.brand.id,
        name: product.brand.name,
        description: product.brand.description ?? undefined,
        logo: product.brand.logo ?? undefined,
        website: product.brand.website ?? undefined,
        isActive: product.brand.isActive,
        createdAt: product.brand.createdAt.toISOString(),
        updatedAt: product.brand.updatedAt.toISOString(),
      },
      reviews: product.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment ?? undefined,
        author: review.author ?? undefined,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
      })),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));

    return {
      products: productsWithRating,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}
