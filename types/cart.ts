import { Product } from './product';

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  addedAt: string;
  updatedAt: string;
  product: Product;
}

export interface Cart {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AddToCartPayload {
  product: Product;
  quantity?: number;
}

export interface UpdateQuantityPayload {
  id: number;
  quantity: number;
}

export interface RemoveFromCartPayload {
  id: number;
}
