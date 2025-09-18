# Database-Driven Cart System

This document describes the implementation of a database-driven cart system that replaces localStorage with persistent database storage.

## Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Redux Integration](#redux-integration)
- [Component Updates](#component-updates)
- [Authentication](#authentication)
- [Benefits](#benefits)

## Overview

The cart system has been completely refactored to use database storage instead of localStorage. This provides:

- **User-Specific Carts**: Each user has their own cart
- **Data Persistence**: Cart data survives browser refreshes and device changes
- **Real-time Sync**: Cart updates are immediately saved to database
- **Authentication Required**: Only authenticated users can manage carts
- **Better Performance**: Optimized database queries with proper indexing

## Database Schema

### Cart Model

```prisma
model Cart {
  id        Int        @id @default(autoincrement())
  userId    Int        @unique
  isOpen    Boolean    @default(false)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]
}
```

**Fields:**
- `id`: Unique cart identifier
- `userId`: Foreign key to User (one cart per user)
- `isOpen`: Whether cart sidebar is open
- `createdAt`: When cart was created
- `updatedAt`: When cart was last modified
- `user`: User relation
- `items`: Cart items relation

### CartItem Model

```prisma
model CartItem {
  id        Int      @id @default(autoincrement())
  cartId    Int
  productId Int
  quantity  Int      @default(1)
  addedAt   DateTime @default(now())
  updatedAt DateTime @updatedAt
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  @@unique([cartId, productId])
}
```

**Fields:**
- `id`: Unique cart item identifier
- `cartId`: Foreign key to Cart
- `productId`: Foreign key to Product
- `quantity`: Number of items
- `addedAt`: When item was added
- `updatedAt`: When item was last modified
- `cart`: Cart relation
- `product`: Product relation with full details

**Constraints:**
- `@@unique([cartId, productId])`: Prevents duplicate products in same cart

## API Endpoints

### GET /api/cart

Fetch user's cart with all items and product details.

**Authentication:** Required

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "isOpen": false,
  "createdAt": "2025-01-18T12:00:00Z",
  "updatedAt": "2025-01-18T12:00:00Z",
  "items": [
    {
      "id": 1,
      "cartId": 1,
      "productId": 1,
      "quantity": 2,
      "addedAt": "2025-01-18T12:00:00Z",
      "updatedAt": "2025-01-18T12:00:00Z",
      "product": {
        "id": 1,
        "title": "iPhone 15 Pro",
        "price": 999.99,
        "category": { "name": "Electronics" },
        "brand": { "name": "Apple" }
      }
    }
  ]
}
```

### POST /api/cart

Add item to cart or update quantity if already exists.

**Authentication:** Required

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Response:**
```json
{
  "id": 1,
  "cartId": 1,
  "productId": 1,
  "quantity": 3,
  "addedAt": "2025-01-18T12:00:00Z",
  "updatedAt": "2025-01-18T12:00:00Z",
  "product": {
    "id": 1,
    "title": "iPhone 15 Pro",
    "price": 999.99
  }
}
```

### PUT /api/cart

Update cart open status.

**Authentication:** Required

**Request Body:**
```json
{
  "isOpen": true
}
```

### PUT /api/cart/items

Update cart item quantity.

**Authentication:** Required

**Request Body:**
```json
{
  "itemId": 1,
  "quantity": 5
}
```

### DELETE /api/cart/items?itemId=1

Remove item from cart.

**Authentication:** Required

## Redux Integration

### Updated Cart State

```typescript
export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
}
```

**New Fields:**
- `isLoading`: Loading state for async operations
- `error`: Error messages from API calls

### Async Thunks

#### fetchCart
```typescript
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const cart = await CartAPI.getCart();
      return cart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

#### addToCart
```typescript
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ product, quantity = 1 }: AddToCartPayload, { rejectWithValue }) => {
    try {
      const cartItem = await CartAPI.addToCart(product.id, quantity);
      return cartItem;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

#### updateItemQuantity
```typescript
export const updateItemQuantity = createAsyncThunk(
  'cart/updateItemQuantity',
  async ({ id, quantity }: UpdateQuantityPayload, { rejectWithValue }) => {
    try {
      const result = await CartAPI.updateItemQuantity(id, quantity);
      return { id, quantity, result };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

#### removeFromCart
```typescript
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ id }: RemoveFromCartPayload, { rejectWithValue }) => {
    try {
      await CartAPI.removeItem(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

### Redux Extra Reducers

All async thunks are handled in the `extraReducers` section:

```typescript
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
      state.isOpen = action.payload.isOpen;
      const { totalItems, totalPrice } = calculateTotals(action.payload.items);
      state.totalItems = totalItems;
      state.totalPrice = totalPrice;
    })
    .addCase(fetchCart.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  // ... other cases
}
```

## Component Updates

### CartIcon Component

```typescript
export default function CartIcon() {
  const dispatch = useAppDispatch();
  const { totalItems, isLoading } = useAppSelector((state) => state.cart);

  // Fetch cart when component mounts
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  return (
    <Button 
      onClick={() => dispatch(openCart())}
      disabled={isLoading}
    >
      <ShoppingCart />
      {totalItems > 0 && (
        <span className="cart-badge">{totalItems}</span>
      )}
    </Button>
  );
}
```

**Changes:**
- Added `useEffect` to fetch cart on mount
- Uses `totalItems` from Redux state
- Shows loading state during API calls

### AddToCartButton Component

```typescript
// Check if product is already in cart
const cartItems = useAppSelector((state) => state.cart.items);
const cartItem = cartItems.find(item => item.productId === product.id);
const isInCart = !!cartItem;
```

**Changes:**
- Updated to use `productId` instead of `id` for cart item lookup
- Redux actions now trigger database API calls

### CartSidebar Component

No changes needed - already uses Redux actions that now trigger database operations.

## Authentication

### Server-Side Authentication

All cart API endpoints require authentication:

```typescript
const session = await getServerSession(authOptions);

if (!session?.user?.id) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}
```

### User-Specific Carts

Each user gets their own cart:

```typescript
const userId = parseInt(session.user.id);

// Get or create cart for user
let cart = await prisma.cart.findUnique({
  where: { userId },
});
```

### Cart Security

- **User Isolation**: Users can only access their own cart
- **Item Verification**: Cart items are verified to belong to the user
- **Session Validation**: All operations require valid session

## Benefits

### 1. Data Persistence
- **Cross-Device Sync**: Cart available on all devices
- **Browser Refresh**: Cart survives page reloads
- **Session Recovery**: Cart persists across login sessions

### 2. User Experience
- **Real-time Updates**: Changes immediately saved to database
- **Error Handling**: Proper error states and user feedback
- **Loading States**: Visual feedback during operations

### 3. Performance
- **Optimized Queries**: Efficient database queries with relations
- **Caching**: Redux state caching for better performance
- **Batch Operations**: Multiple cart operations in single API call

### 4. Scalability
- **Database Storage**: Handles large numbers of users and items
- **Indexing**: Proper database indexes for fast queries
- **Relations**: Efficient joins for product details

## Migration from localStorage

### Before (localStorage)
```typescript
// Load from localStorage
const loadCartFromStorage = (): CartState => {
  const savedCart = localStorage.getItem('cart');
  return savedCart ? JSON.parse(savedCart) : initialState;
};

// Save to localStorage
const saveCartToStorage = (cart: CartState) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};
```

### After (Database)
```typescript
// Fetch from database
const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async () => {
    const cart = await CartAPI.getCart();
    return cart;
  }
);

// All operations automatically save to database
dispatch(addToCart({ product, quantity }));
```

## Error Handling

### API Error Handling
```typescript
try {
  const cart = await CartAPI.getCart();
  return cart;
} catch (error) {
  return rejectWithValue(error.message);
}
```

### User Feedback
```typescript
// Success notifications
success('Added to cart', `${product.title} has been added to your cart`);

// Error notifications
handleError(error, 'Adding to Cart');
```

### Loading States
```typescript
// Component loading state
disabled={isLoading}

// Global loading state
state.isLoading = true;
```

## Testing

### Unit Tests
```typescript
// Test Redux actions
test('should add item to cart', async () => {
  const product = { id: 1, title: 'Test Product' };
  const result = await store.dispatch(addToCart({ product }));
  expect(result.type).toBe('cart/addToCart/fulfilled');
});
```

### Integration Tests
```typescript
// Test API endpoints
test('GET /api/cart should return user cart', async () => {
  const response = await request(app)
    .get('/api/cart')
    .set('Authorization', `Bearer ${token}`);
  
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('items');
});
```

## Future Enhancements

### Cart Analytics
- Track cart abandonment
- Popular products in carts
- Cart conversion rates

### Cart Sharing
- Share cart with others
- Cart wishlist functionality
- Cart templates

### Advanced Features
- Cart expiration
- Cart notifications
- Bulk cart operations
- Cart history

---

**Last Updated**: January 2025  
**Version**: 4.0.0  
**Maintainer**: Development Team
