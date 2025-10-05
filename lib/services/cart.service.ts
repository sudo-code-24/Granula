import { Cart, CartItem } from '@/app/generated/prisma';
import { CartRepository } from '@/lib/repositories/cart.repository';
import { APIResponse } from '@/types/APIResponse';

export interface AddToCartData {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

export interface CartServiceResponse {
  success: boolean;
  message?: string;
  cart?: any;
  error?: string;
}

export class CartService {
  private cartRepository: CartRepository;

  constructor() {
    this.cartRepository = new CartRepository();
  }

  /**
   * Get user's cart
   */
  async getCart(userId: number) {
    try {
      const cart = await this.cartRepository.getOrCreateCart(userId);
      return {
        success: true,
        cart,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get cart',
      };
    }
  }

  /**
   * Add item to cart
   */
  async addItem(userId: number, data: AddToCartData): Promise<APIResponse<CartItem>> {
    try {
      // Validate input
      const validation = this.validateAddToCartData(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
        };
      }

      const cartItem = await this.cartRepository.addItem(userId, data);

      return {
        success: true,
        data: cartItem,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add item to cart',
      };
    }
  }

  /**
   * Update cart item quantity
   */
  async updateItemQuantity(userId: number, itemId: number, quantity: number): Promise<CartServiceResponse> {
    try {
      // Validate input
      if (quantity < 0) {
        return {
          success: false,
          error: 'Quantity cannot be negative',
        };
      }

      const cart = await this.cartRepository.updateItemQuantity(userId, itemId, quantity);

      return {
        success: true,
        message: 'Cart item updated successfully',
        cart,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update cart item',
      };
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: number, itemId: number): Promise<CartServiceResponse> {
    try {
      const cart = await this.cartRepository.removeItem(userId, itemId);

      return {
        success: true,
        message: 'Item removed from cart successfully',
        cart,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove item from cart',
      };
    }
  }

  /**
   * Clear all items from cart
   */
  async clearCart(userId: number): Promise<CartServiceResponse> {
    try {
      const cart = await this.cartRepository.clearCart(userId);

      return {
        success: true,
        message: 'Cart cleared successfully',
        cart,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear cart',
      };
    }
  }

  /**
   * Get cart summary
   */
  async getCartSummary(userId: number) {
    try {
      const summary = await this.cartRepository.getCartSummary(userId);
      return {
        success: true,
        summary,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get cart summary',
      };
    }
  }

  /**
   * Check if product is in cart
   */
  async isProductInCart(userId: number, productId: number): Promise<boolean> {
    try {
      return await this.cartRepository.isProductInCart(userId, productId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get product quantity in cart
   */
  async getProductQuantity(userId: number, productId: number): Promise<number> {
    try {
      return await this.cartRepository.getProductQuantity(userId, productId);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get cart item count
   */
  async getItemCount(userId: number): Promise<number> {
    try {
      return await this.cartRepository.getItemCount(userId);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Validate cart items (remove inactive products)
   */
  async validateCartItems(userId: number): Promise<CartServiceResponse> {
    try {
      const { validItems, invalidItems } = await this.cartRepository.validateCartItems(userId);

      if (invalidItems.length > 0) {
        // Remove invalid items
        const cart = await this.cartRepository.removeInvalidItems(userId);

        return {
          success: true,
          message: `${invalidItems.length} invalid items removed from cart`,
          cart,
        };
      }

      return {
        success: true,
        message: 'All cart items are valid',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate cart items',
      };
    }
  }

  /**
   * Get cart statistics
   */
  async getCartStats() {
    try {
      const stats = await this.cartRepository.getStats();
      return {
        success: true,
        stats,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get cart statistics',
      };
    }
  }

  /**
   * Delete user's cart
   */
  async deleteCart(userId: number): Promise<CartServiceResponse> {
    try {
      await this.cartRepository.deleteCart(userId);

      return {
        success: true,
        message: 'Cart deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete cart',
      };
    }
  }

  /**
   * Validate add to cart data
   */
  private validateAddToCartData(data: AddToCartData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.productId || data.productId <= 0) {
      errors.push('Valid product ID is required');
    }

    if (!data.quantity || data.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (data.quantity > 100) {
      errors.push('Quantity cannot exceed 100');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Merge carts (useful for guest to logged-in user)
   */
  async mergeCarts(guestCart: any, userId: number): Promise<CartServiceResponse> {
    try {
      // Get user's existing cart
      const userCart = await this.cartRepository.getOrCreateCart(userId);

      // Add guest cart items to user cart
      for (const item of guestCart.items || []) {
        await this.cartRepository.addItem(userId, {
          productId: item.productId,
          quantity: item.quantity,
        });
      }

      // Get updated cart
      const updatedCart = await this.cartRepository.getOrCreateCart(userId);

      return {
        success: true,
        message: 'Carts merged successfully',
        cart: updatedCart,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to merge carts',
      };
    }
  }

  /**
   * Apply discount to cart
   */
  async applyDiscount(userId: number, discountCode: string): Promise<CartServiceResponse> {
    // This would require a discount system implementation
    // For now, return a placeholder response
    return {
      success: false,
      error: 'Discount system not implemented yet',
    };
  }

  /**
   * Calculate shipping cost
   */
  async calculateShipping(userId: number, shippingMethod: string): Promise<CartServiceResponse> {
    // This would require a shipping system implementation
    // For now, return a placeholder response
    return {
      success: false,
      error: 'Shipping calculation not implemented yet',
    };
  }
}
