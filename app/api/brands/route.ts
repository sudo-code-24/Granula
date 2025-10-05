import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { ErrorHandler } from '@/lib/error-handler';
import { BrandService } from '@/lib/services/brand.service';
import { validateIsActiveParams, parseIsActive } from '../helpers';

export async function GET(request: NextRequest) {
  const brandService = new BrandService();
  try {
    const { searchParams } = new URL(request.url);
    const paramsIsActive = searchParams.get('isActive');
    if (!validateIsActiveParams(paramsIsActive)) {
      return NextResponse.json(
        { error: 'Invalid Request' },
        { status: 400 }
      );
    }
    const brands = await brandService.getBrands(parseIsActive(paramsIsActive))
    return NextResponse.json(brands);

  } catch (error) {
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
