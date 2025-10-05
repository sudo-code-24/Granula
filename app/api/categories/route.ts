import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { ErrorHandler } from '@/lib/error-handler';
import { validateIsActiveParams, parseIsActive } from '../helpers';
import { CategoryService } from '@/lib/services/category.service';

export async function GET(request: NextRequest) {
  try {
    const categoryService = new CategoryService();
    const { searchParams } = new URL(request.url);
    const paramsIsActive = searchParams.get('isActive');
    if (!validateIsActiveParams(paramsIsActive)) {
      return NextResponse.json(
        { error: 'Invalid Request' },
        { status: 400 }
      );
    }
    const categories = await categoryService.getCategories(parseIsActive(paramsIsActive))
    return NextResponse.json(categories);

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const categoryService = new CategoryService();
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
