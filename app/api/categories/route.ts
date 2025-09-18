import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { ErrorHandler } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(categories);

  } catch (error) {
    console.error('Error fetching categories:', error);
    ErrorHandler.handleDatabaseError(error, 'Fetching Categories');
    
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, image } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await prisma.category.create({
      data: {
        name,
        description,
        image,
        slug,
      },
    });

    return NextResponse.json(category, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    ErrorHandler.handleDatabaseError(error, 'Creating Category');
    
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
