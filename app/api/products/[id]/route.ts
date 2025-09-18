import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { ErrorHandler } from '@/lib/error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: number } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Calculate average rating
    const averageRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

    return NextResponse.json({
      ...product,
      rating: averageRating,
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    ErrorHandler.handleDatabaseError(error, 'Fetching Product');

    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: number } }
) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      price,
      discountPercentage,
      stock,
      brandId,
      categoryId,
      thumbnail,
      images,
      tags,
      sku,
    } = body;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(discountPercentage !== undefined && { discountPercentage: parseFloat(discountPercentage) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(brandId && { brandId }),
        ...(categoryId && { categoryId }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(images && { images }),
        ...(tags && { tags }),
        ...(sku && { sku }),
        ...(title && { slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }),
      },
      include: {
        category: true,
        brand: true,
        reviews: true,
      },
    });

    return NextResponse.json(product);

  } catch (error) {
    console.error('Error updating product:', error);
    ErrorHandler.handleDatabaseError(error, 'Updating Product');

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: number } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Error deleting product:', error);
    ErrorHandler.handleDatabaseError(error, 'Deleting Product');

    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
