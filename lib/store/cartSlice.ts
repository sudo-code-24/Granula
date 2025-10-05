import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { CartState, CartItem, AddToCartPayload, UpdateQuantityPayload, RemoveFromCartPayload } from '@/types/cart';
import { CartAPI } from '@/lib/api/cart';

// Helper function to calculate totals
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const discountedPrice = item.product.price - (item.product.price * item.product.discountPercentage / 100);
    return sum + (discountedPrice * item.quantity);
  }, 0);
  return { totalItems, totalPrice };
};

// Async thunks for cart operations
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const cart = await CartAPI.getCart();
      return cart;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ product, quantity = 1 }: AddToCartPayload, { rejectWithValue }) => {
    try {
      const cartItem = await CartAPI.addToCart(product.id, quantity);
      return cartItem;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add to cart');
    }
  }
);

export const updateItemQuantity = createAsyncThunk(
  'cart/updateItemQuantity',
  async ({ id, quantity }: UpdateQuantityPayload, { rejectWithValue }) => {
    try {
      const result = await CartAPI.updateItemQuantity(id, quantity);
      return { id, quantity, result };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update quantity');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ id }: RemoveFromCartPayload, { rejectWithValue }) => {
    try {
      await CartAPI.removeItem(id);
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to remove item');
    }
  }
);


export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      await CartAPI.clearCart();
      return true;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to clear cart');
    }
  }
);

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isOpen: false,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        const { totalItems, totalPrice } = calculateTotals(action.payload.items);
        state.totalItems = totalItems;
        state.totalPrice = totalPrice;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add to cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);

        if (existingItemIndex >= 0) {
          // Update existing item
          state.items[existingItemIndex] = action.payload;
        } else {
          // Add new item
          state.items.push(action.payload);
        }
        console.log(state);

        const { totalItems, totalPrice } = calculateTotals(state.items);
        state.totalItems = totalItems;
        state.totalPrice = totalPrice;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update quantity
    builder
      .addCase(updateItemQuantity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        const { id, quantity } = action.payload;

        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          state.items = state.items.filter(item => item.id !== id);
        } else {
          // Update quantity
          const item = state.items.find(item => item.id === id);
          if (item) {
            item.quantity = quantity;
          }
        }

        const { totalItems, totalPrice } = calculateTotals(state.items);
        state.totalItems = totalItems;
        state.totalPrice = totalPrice;
      })
      .addCase(updateItemQuantity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Remove from cart
    builder
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter(item => item.id !== action.payload);

        const { totalItems, totalPrice } = calculateTotals(state.items);
        state.totalItems = totalItems;
        state.totalPrice = totalPrice;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });


    // Clear cart
    builder
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
        state.totalItems = 0;
        state.totalPrice = 0;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  toggleCart,
  openCart,
  closeCart,
  clearError,
} = cartSlice.actions;

export default cartSlice.reducer;