import { Cart, CartItem } from '@/types/cart';

export class CartAPI {
  private static baseUrl = '/api/cart';

  /**
   * Get user's cart
   */
  static async getCart(): Promise<Cart> {
    const response = await fetch(this.baseUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch cart: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Add item to cart
   */
  static async addToCart(productId: number, quantity: number = 1): Promise<CartItem> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, quantity }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add to cart: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Update cart item quantity
   */
  static async updateItemQuantity(itemId: number, quantity: number): Promise<CartItem | { message: string }> {
    const response = await fetch(`${this.baseUrl}/items`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemId, quantity }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update cart item: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Remove item from cart
   */
  static async removeItem(itemId: number): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/items?itemId=${itemId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to remove cart item: ${response.status}`);
    }

    return response.json();
  }


  /**
   * Clear entire cart
   */
  static async clearCart(): Promise<{ message: string }> {
    const cart = await this.getCart();
    
    // Remove all items
    const deletePromises = cart.items.map(item => 
      this.removeItem(item.id)
    );
    
    await Promise.all(deletePromises);
    
    return { message: 'Cart cleared' };
  }
}
