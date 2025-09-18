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

    const brands = await prisma.brand.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(brands);

  } catch (error) {
    console.error('Error fetching brands:', error);
    ErrorHandler.handleDatabaseError(error, 'Fetching Brands');
    
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, logo, website } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        description,
        logo,
        website,
      },
    });

    return NextResponse.json(brand, { status: 201 });

  } catch (error) {
    console.error('Error creating brand:', error);
    ErrorHandler.handleDatabaseError(error, 'Creating Brand');
    
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    );
  }
}
