import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/database';
import { ErrorHandler } from '@/lib/error-handler';
import { AddToCartData, CartService } from '@/lib/services/cart.service';

export async function GET(request: NextRequest) {
  try {
    const cartService = new CartService();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    // Get or create cart for user
    let cart = await cartService.getCart(userId);
    if (!cart.success) {
      throw new Error(cart.error)
    }
    return NextResponse.json(cart.cart);

  } catch (error) {
    ErrorHandler.handleDatabaseError(error, 'Fetching Cart');

    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cartService = new CartService();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    if (quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }
    const payload: AddToCartData = { productId, quantity };
    let cart_result = await cartService.addItem(userId, payload);
    if (!cart_result.success) {
      throw new Error(cart_result.error)
    }

    return NextResponse.json(cart_result.data , { status: 201 });

  } catch (error) {
    console.error('Error adding to cart:', error);
    ErrorHandler.handleDatabaseError(error, 'Adding to Cart');

    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

