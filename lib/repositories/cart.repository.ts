import { prisma } from '@/lib/database';
import { Cart, CartItem, Prisma } from '@/app/generated/prisma';
import { BaseRepository } from './base.repository';

export interface CartWithItems extends Cart {
  items: CartItemWithProduct[];
  user: {
    id: number;
    email: string;
    roleId: number;
  };
}

export interface CartItemWithProduct {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  addedAt: Date;
  updatedAt: Date;
  product: {
    id: number;
    title: string;
    price: number;
    discountPercentage: number;
    thumbnail?: string;
    slug: string;
    isActive: boolean;
  };
}

export interface CartSummary {
  totalItems: number;
  totalPrice: number;
  totalDiscount: number;
  finalPrice: number;
}

export interface AddToCartData {
  productId: number;
  quantity: number;
}

export class CartRepository extends BaseRepository<
  Cart,
  Prisma.CartCreateInput,
  Prisma.CartUpdateInput
> {
  constructor() {
    super(prisma.cart);
  }

  /**
   * Get or create cart for user
   */
  async getOrCreateCart(userId: number): Promise<CartWithItems> {
    let cart = await this.findCartByUserId(userId);

    if (!cart) {
      cart = await this.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  discountPercentage: true,
                  thumbnail: true,
                  slug: true,
                  isActive: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              roleId: true,
            },
          },
        },
      });
    }

    if (!cart) {
      throw new Error('Failed to create cart');
    }

    return cart;
  }

  /**
   * Find cart by user ID
   */
  async findCartByUserId(userId: number): Promise<CartWithItems | null> {
    const carts = await this.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                discountPercentage: true,
                thumbnail: true,
                slug: true,
                isActive: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            roleId: true,
          },
        },
      },
      take: 1,
    });

    return carts[0] || null;
  }

  /**
   * Add item to cart
   */
  async addItem(userId: number, data: AddToCartData): Promise<CartItem> {
    const { productId, quantity } = data;

    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    // Get or create cart
    const cart = await this.getOrCreateCart(userId);

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: { cartId: cart.id, productId }, // use composite key if defined
      },
    });

    if (existingItem) {
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: {
          product: {
            include: {
              category: true,
              brand: true,
            },
          },
        },
      });

    }

    // Create new item
    return prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
      include: {
        product: {
          include: {
            category: true,
            brand: true,
          },
        },
      },
    });
  }

  /**
   * Update cart item quantity
   */
  async updateItemQuantity(userId: number, itemId: number, quantity: number): Promise<CartWithItems> {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      return this.removeItem(userId, itemId);
    }

    // Verify item belongs to user's cart
    const cart = await this.findCartByUserId(userId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    const item = cart.items.find(item => item.id === itemId);
    if (!item) {
      throw new Error('Item not found in cart');
    }

    // Update quantity
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    // Return updated cart
    const updatedCart = await this.findCartByUserId(userId);
    if (!updatedCart) {
      throw new Error('Failed to retrieve updated cart');
    }
    return updatedCart;
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: number, itemId: number): Promise<CartWithItems> {
    // Verify item belongs to user's cart
    const cart = await this.findCartByUserId(userId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    const item = cart.items.find(item => item.id === itemId);
    if (!item) {
      throw new Error('Item not found in cart');
    }

    // Remove item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    // Return updated cart
    const updatedCart = await this.findCartByUserId(userId);
    if (!updatedCart) {
      throw new Error('Failed to retrieve updated cart');
    }
    return updatedCart;
  }

  /**
   * Clear all items from cart
   */
  async clearCart(userId: number): Promise<CartWithItems> {
    const cart = await this.findCartByUserId(userId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    // Remove all items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Return updated cart
    const updatedCart = await this.findCartByUserId(userId);
    if (!updatedCart) {
      throw new Error('Failed to retrieve updated cart');
    }
    return updatedCart;
  }

  /**
   * Get cart summary (totals, discounts, etc.)
   */
  async getCartSummary(userId: number): Promise<CartSummary> {
    const cart = await this.findCartByUserId(userId);
    if (!cart || cart.items.length === 0) {
      return {
        totalItems: 0,
        totalPrice: 0,
        totalDiscount: 0,
        finalPrice: 0,
      };
    }

    let totalItems = 0;
    let totalPrice = 0;
    let totalDiscount = 0;

    for (const item of cart.items) {
      const { product, quantity } = item;
      const itemPrice = product.price * quantity;
      const discount = (itemPrice * product.discountPercentage) / 100;

      totalItems += quantity;
      totalPrice += itemPrice;
      totalDiscount += discount;
    }

    const finalPrice = totalPrice - totalDiscount;

    return {
      totalItems,
      totalPrice,
      totalDiscount,
      finalPrice,
    };
  }

  /**
   * Check if product is in cart
   */
  async isProductInCart(userId: number, productId: number): Promise<boolean> {
    const cart = await this.findCartByUserId(userId);
    if (!cart) return false;

    return cart.items.some(item => item.productId === productId);
  }

  /**
   * Get item quantity for product in cart
   */
  async getProductQuantity(userId: number, productId: number): Promise<number> {
    const cart = await this.findCartByUserId(userId);
    if (!cart) return 0;

    const item = cart.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  }

  /**
   * Get cart item count
   */
  async getItemCount(userId: number): Promise<number> {
    const cart = await this.findCartByUserId(userId);
    if (!cart) return 0;

    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Validate cart items (check if products are still active)
   */
  async validateCartItems(userId: number): Promise<{
    validItems: CartItemWithProduct[];
    invalidItems: CartItemWithProduct[];
  }> {
    const cart = await this.findCartByUserId(userId);
    if (!cart) {
      return { validItems: [], invalidItems: [] };
    }

    const validItems: CartItemWithProduct[] = [];
    const invalidItems: CartItemWithProduct[] = [];

    for (const item of cart.items) {
      if (item.product.isActive) {
        validItems.push(item);
      } else {
        invalidItems.push(item);
      }
    }

    return { validItems, invalidItems };
  }

  /**
   * Remove invalid items from cart
   */
  async removeInvalidItems(userId: number): Promise<CartWithItems> {
    const { invalidItems } = await this.validateCartItems(userId);

    if (invalidItems.length > 0) {
      const invalidItemIds = invalidItems.map(item => item.id);
      await prisma.cartItem.deleteMany({
        where: {
          id: { in: invalidItemIds },
        },
      });
    }

    return this.findCartByUserId(userId) as Promise<CartWithItems>;
  }

  /**
   * Get cart statistics
   */
  async getStats() {
    const [totalCarts, totalItems, averageItemsPerCart] = await Promise.all([
      this.count(),
      prisma.cartItem.count(),
      prisma.cartItem.groupBy({
        by: ['cartId'],
        _count: {
          id: true,
        },
      }).then(groups => {
        const totalCarts = groups.length;
        const totalItems = groups.reduce((sum, group) => sum + group._count.id, 0);
        return totalCarts > 0 ? totalItems / totalCarts : 0;
      }),
    ]);

    return {
      totalCarts,
      totalItems,
      averageItemsPerCart,
    };
  }

  /**
   * Delete cart and all items
   */
  async deleteCart(userId: number): Promise<void> {
    const cart = await this.findCartByUserId(userId);
    if (!cart) return;

    // Delete all items first
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Delete cart
    await this.delete({
      where: { id: cart.id },
    });
  }
}