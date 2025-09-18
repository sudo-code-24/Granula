# Migration Guide: Implementing Hydration-Safe Patterns

This guide walks you through migrating existing components to use our hydration-safe patterns.

## Table of Contents

- [Quick Start](#quick-start)
- [Migration Checklist](#migration-checklist)
- [Step-by-Step Examples](#step-by-step-examples)
- [Common Patterns](#common-patterns)
- [Testing Your Changes](#testing-your-changes)
- [Rollback Plan](#rollback-plan)

## Quick Start

### 1. Install Dependencies

The utilities are already available in the project:

```typescript
import { useClientSide } from '@/hooks/use-client-side';
import { ClientOnly } from '@/components/ClientOnly';
```

### 2. Identify Components to Migrate

Look for these patterns in your codebase:

- Components using `useAuthGuard()` without client checks
- Components accessing `localStorage` or `sessionStorage`
- Components using `window` or `document` objects
- Components with Redux state from localStorage
- Components with theme-dependent rendering

### 3. Choose Migration Strategy

- **Page Components**: Use `useClientSide()` hook
- **Component Parts**: Use `ClientOnly` wrapper
- **Entire Components**: Wrap with `ClientOnly`

## Migration Checklist

### Pre-Migration

- [ ] Identify all components with hydration issues
- [ ] Test current behavior to establish baseline
- [ ] Document current hydration errors
- [ ] Plan fallback content for each component

### During Migration

- [ ] Add appropriate imports
- [ ] Implement client-side checks
- [ ] Add meaningful fallbacks
- [ ] Test each component individually
- [ ] Verify no new errors introduced

### Post-Migration

- [ ] Test complete user flows
- [ ] Verify SSR still works
- [ ] Check performance impact
- [ ] Update documentation
- [ ] Remove old patterns

## Step-by-Step Examples

### Example 1: Page Component Migration

#### Before (Problematic)

```typescript
// app/dashboard/page.tsx
"use client";

import { useAuthGuard } from '@/lib/useAuthGuard';

export default function DashboardPage() {
  const { user, isLoading, isAuthorized } = useAuthGuard();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthorized) return <UnauthorizedAccess />;
  
  return <DashboardContent />;
}
```

**Issues**:
- `useAuthGuard()` causes hydration mismatch
- Server doesn't know authentication state
- Client renders different content than server

#### After (Fixed)

```typescript
// app/dashboard/page.tsx
"use client";

import { useAuthGuard } from '@/lib/useAuthGuard';
import { useClientSide } from '@/hooks/use-client-side';

export default function DashboardPage() {
  const isClient = useClientSide();
  const { user, isLoading, isAuthorized } = useAuthGuard();
  
  // Prevent hydration mismatch
  if (!isClient) return <LoadingSpinner />;
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthorized) return <UnauthorizedAccess />;
  
  return <DashboardContent />;
}
```

**Changes**:
1. Added `useClientSide` import
2. Added client-side check before auth checks
3. Server now renders consistent loading state

### Example 2: Component with Local Storage

#### Before (Problematic)

```typescript
// components/CartIcon.tsx
export default function CartIcon() {
  const cartItems = useAppSelector(state => state.cart.items);
  const cartCount = cartItems.length;
  
  return (
    <Button>
      <ShoppingCart />
      {cartCount > 0 && <Badge>{cartCount}</Badge>}
    </Button>
  );
}
```

**Issues**:
- Cart state from localStorage differs between server/client
- Badge count causes hydration mismatch

#### After (Fixed)

```typescript
// components/CartIcon.tsx
import { ClientOnly } from '@/components/ClientOnly';

export default function CartIcon() {
  const cartItems = useAppSelector(state => state.cart.items);
  const cartCount = cartItems.length;
  
  return (
    <Button>
      <ShoppingCart />
      <ClientOnly>
        {cartCount > 0 && <Badge>{cartCount}</Badge>}
      </ClientOnly>
    </Button>
  );
}
```

**Changes**:
1. Added `ClientOnly` import
2. Wrapped cart count in `ClientOnly`
3. Server renders button without badge

### Example 3: Complex Component Migration

#### Before (Problematic)

```typescript
// components/ProductCard.tsx
export default function ProductCard({ product }) {
  const [isInCart, setIsInCart] = useState(false);
  const cartItems = useAppSelector(state => state.cart.items);
  
  useEffect(() => {
    setIsInCart(cartItems.some(item => item.id === product.id));
  }, [cartItems, product.id]);
  
  return (
    <div>
      <h3>{product.title}</h3>
      <Button>
        {isInCart ? `In Cart (${cartItem.quantity})` : 'Add to Cart'}
      </Button>
    </div>
  );
}
```

**Issues**:
- Cart state causes hydration mismatch
- Button text differs between server/client

#### After (Fixed)

```typescript
// components/ProductCard.tsx
import { ClientOnly } from '@/components/ClientOnly';

export default function ProductCard({ product }) {
  const [isInCart, setIsInCart] = useState(false);
  const cartItems = useAppSelector(state => state.cart.items);
  
  useEffect(() => {
    setIsInCart(cartItems.some(item => item.id === product.id));
  }, [cartItems, product.id]);
  
  return (
    <div>
      <h3>{product.title}</h3>
      <Button>
        <ClientOnly fallback="Add to Cart">
          {isInCart ? `In Cart (${cartItem.quantity})` : 'Add to Cart'}
        </ClientOnly>
      </Button>
    </div>
  );
}
```

**Changes**:
1. Added `ClientOnly` wrapper
2. Provided fallback text
3. Server renders consistent button text

## Common Patterns

### Pattern 1: Authentication Pages

**When to use**: Pages that require authentication

```typescript
// Pattern
const isClient = useClientSide();
if (!isClient) return <LoadingSpinner />;
// ... rest of auth logic
```

**Files to migrate**:
- `app/dashboard/page.tsx`
- `app/profile/page.tsx`
- `app/admin/page.tsx`
- `app/products/page.tsx`

### Pattern 2: Cart Components

**When to use**: Components that display cart state

```typescript
// Pattern
<ClientOnly>
  {cartCount > 0 && <Badge>{cartCount}</Badge>}
</ClientOnly>
```

**Files to migrate**:
- `app/components/Cart/CartIcon.tsx`
- `app/components/Cart/CartSidebar.tsx`
- `app/components/Product/AddToCartButton.tsx`

### Pattern 3: Theme Components

**When to use**: Components that depend on theme state

```typescript
// Pattern
const isClient = useClientSide();
if (!isClient) return <DefaultThemeIcon />;
// ... theme-dependent logic
```

**Files to migrate**:
- `app/components/theme-provider.tsx`
- Any theme-dependent components

### Pattern 4: Local Storage Components

**When to use**: Components that read from localStorage

```typescript
// Pattern
const isClient = useClientSide();
const [data, setData] = useState(null);

useEffect(() => {
  if (isClient) {
    const saved = localStorage.getItem('key');
    setData(JSON.parse(saved || 'null'));
  }
}, [isClient]);
```

## Testing Your Changes

### 1. Check Browser Console

Look for hydration error messages:

```
✅ Good: No hydration errors
❌ Bad: "Hydration failed because the server rendered HTML didn't match the client"
```

### 2. Test SSR

```bash
# Build and test SSR
npm run build
npm run start

# Check that pages load without errors
```

### 3. Test Client-Side

```bash
# Development mode
npm run dev

# Test with slow network to see loading states
# Open DevTools > Network > Slow 3G
```

### 4. Test User Flows

- [ ] Login/logout flow
- [ ] Add/remove from cart
- [ ] Navigate between pages
- [ ] Refresh pages
- [ ] Direct URL access

### 5. Automated Testing

```typescript
// Example test
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

test('renders fallback during SSR', () => {
  // Mock server-side rendering
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      matches: false,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  });
  
  render(<MyComponent />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

test('renders client content after hydration', async () => {
  render(<MyComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Client Content')).toBeInTheDocument();
  });
});
```

## Rollback Plan

If issues arise, you can rollback by:

### 1. Revert Individual Components

```bash
# Revert specific file
git checkout HEAD~1 -- app/dashboard/page.tsx
```

### 2. Revert All Changes

```bash
# Revert all migration changes
git checkout HEAD~1 -- .
```

### 3. Partial Rollback

```typescript
// Temporarily disable client-side checks
const isClient = true; // Force client-side behavior
// or
// const isClient = useClientSide();
```

## Common Issues and Solutions

### Issue 1: Still Getting Hydration Errors

**Cause**: Not all client-dependent code is wrapped

**Solution**: 
- Check for direct `localStorage` usage
- Look for `window` or `document` references
- Ensure all Redux state from localStorage is wrapped

### Issue 2: Content Flickers

**Cause**: Fallback content too different from client content

**Solution**:
- Make fallback content similar to client content
- Use skeleton loaders
- Consider progressive enhancement

### Issue 3: Performance Impact

**Cause**: Too many client-side checks

**Solution**:
- Use `ClientOnly` for granular control
- Avoid wrapping large components
- Consider lazy loading

### Issue 4: TypeScript Errors

**Cause**: Missing type definitions

**Solution**:
- Ensure proper imports
- Check TypeScript configuration
- Add type assertions if needed

## Next Steps

After migration:

1. **Monitor**: Watch for hydration errors in production
2. **Optimize**: Fine-tune fallback content
3. **Document**: Update team documentation
4. **Train**: Share patterns with team members
5. **Iterate**: Refine patterns based on usage

## Related Documentation

- [Hydration Patterns Guide](./HYDRATION_PATTERNS.md)
- [API Reference](./API_REFERENCE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
