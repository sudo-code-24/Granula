import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { ErrorHandler } from '@/lib/error-handler';
import { ProductService } from '@/lib/services/product.service';
import { SortOption } from '@/types/product';
import { Product } from '@/app/generated/prisma';

export async function GET(request: NextRequest) {
  try {
    const productService = new ProductService();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const categoryParams = searchParams.getAll("category"); // string[]
    const categoryIds = categoryParams.map(Number).filter(Boolean); // numbers[]

    const brandParams = searchParams.getAll("brand");
    const brandIds = brandParams.map(Number).filter(Boolean);
    const sort = searchParams.get('sort') || undefined;

    const result = await productService.getProducts({
      page,
      limit,
      search,
      categoryIds,
      brandIds,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort: sort as SortOption,
    });

    const { products, total, totalPages } = result;
    // Calculate average rating for each product
    const productsWithRating = products.map(product => ({
      ...product,
      rating: product.reviews.length > 0
        ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
        : 0,
    }));

    return NextResponse.json({
      products: productsWithRating,
      total,
      page,
      limit,
      totalPages,
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    ErrorHandler.handleDatabaseError(error, 'Fetching Products');

    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const productService = new ProductService();
    const body = await request.json();
    const {
      title,
      description,
      price,
      discountPercentage = 0,
      stock = 0,
      brandId,
      categoryId,
      thumbnail,
      images = [],
      tags = [],
      sku,
    } = body;

    // Validate required fields
    if (!title || !description || !price || !brandId || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product: Product = await productService.createProduct({
      title,
      description,
      price,
      stock,
      slug,
      categoryId,
      brandId,
      thumbnail,
      images,
      tags,
      sku,
      discountPercentage
    })

    return NextResponse.json(product, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    ErrorHandler.handleDatabaseError(error, 'Creating Product');

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
