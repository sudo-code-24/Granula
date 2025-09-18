import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { ErrorHandler } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (category) {
      where.category = { name: { contains: category, mode: 'insensitive' } };
    }

    if (brand) {
      where.brand = { name: { contains: brand, mode: 'insensitive' } };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
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
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate average rating for each product
    const productsWithRating = products.map(product => ({
      ...product,
      rating: product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
    }));

    return NextResponse.json({
      products: productsWithRating,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        discountPercentage: parseFloat(discountPercentage),
        stock: parseInt(stock),
        brandId,
        categoryId,
        thumbnail,
        images,
        tags,
        sku,
        slug,
      },
      include: {
        category: true,
        brand: true,
        reviews: true,
      },
    });

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
