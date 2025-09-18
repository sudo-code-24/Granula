# Hydration-Safe Patterns Documentation

This document outlines the patterns and utilities we've implemented to prevent hydration mismatches in our Next.js application.

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution Architecture](#solution-architecture)
- [Available Utilities](#available-utilities)
- [Usage Patterns](#usage-patterns)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)
- [Troubleshooting](#troubleshooting)

## Overview

Hydration mismatches occur when the server-rendered HTML doesn't match what React renders on the client side. This commonly happens with:

- Authentication state (only available on client)
- localStorage/sessionStorage data
- Theme preferences
- Cart state
- Any client-side only APIs

## Problem Statement

### Common Hydration Issues

1. **Authentication State**: Server doesn't know user login status
2. **Local Storage**: Server can't access browser storage
3. **Theme State**: Theme preferences stored in localStorage
4. **Cart State**: Shopping cart data from localStorage
5. **Window Object**: `window`, `document` not available on server

### Error Example

```
Hydration failed because the server rendered HTML didn't match the client.
```

## Solution Architecture

We've implemented a two-layer approach:

1. **`useClientSide` Hook**: Detects when component is running on client
2. **`ClientOnly` Component**: Wraps content that should only render on client

## Available Utilities

### 1. `useClientSide` Hook

**Location**: `hooks/use-client-side.ts`

```typescript
import { useClientSide } from '@/hooks/use-client-side';

function MyComponent() {
  const isClient = useClientSide();
  
  if (!isClient) {
    return <LoadingSpinner />; // Server-safe fallback
  }
  
  // Client-side only code here
  return <div>Client content</div>;
}
```

**Returns**: `boolean` - `true` when running on client, `false` during SSR

### 2. `ClientOnly` Component

**Location**: `components/ClientOnly.tsx`

```typescript
import { ClientOnly } from '@/components/ClientOnly';

function MyComponent() {
  return (
    <div>
      <h1>Always visible</h1>
      <ClientOnly fallback={<div>Loading...</div>}>
        <div>Only visible on client</div>
      </ClientOnly>
    </div>
  );
}
```

**Props**:
- `children`: Content to render on client side
- `fallback?`: Optional fallback content during SSR

## Usage Patterns

### Pattern 1: Page-Level Authentication

```typescript
// Before (Problematic)
export default function DashboardPage() {
  const { user, isLoading, isAuthorized } = useAuthGuard();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthorized) return <UnauthorizedAccess />;
  // This causes hydration mismatch!
}

// After (Fixed)
export default function DashboardPage() {
  const isClient = useClientSide();
  const { user, isLoading, isAuthorized } = useAuthGuard();
  
  if (!isClient) return <LoadingSpinner />;
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthorized) return <UnauthorizedAccess />;
  // Now safe!
}
```

### Pattern 2: Component-Level Client State

```typescript
// Before (Problematic)
function CartIcon() {
  const cartItems = useAppSelector(state => state.cart.items);
  const cartCount = cartItems.length;
  
  return (
    <Button>
      <ShoppingCart />
      {cartCount > 0 && <Badge>{cartCount}</Badge>}
    </Button>
  );
}

// After (Fixed)
function CartIcon() {
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

### Pattern 3: Complex Client-Only Components

```typescript
// For components that are entirely client-dependent
function CartSidebar() {
  const { items, isOpen } = useAppSelector(state => state.cart);
  
  if (!isOpen) return null;
  
  return (
    <ClientOnly>
      <div className="cart-sidebar">
        {/* Complex cart UI */}
      </div>
    </ClientOnly>
  );
}
```

## Best Practices

### ✅ Do

1. **Use `useClientSide` for page-level checks**
   ```typescript
   const isClient = useClientSide();
   if (!isClient) return <LoadingSpinner />;
   ```

2. **Use `ClientOnly` for component-level wrapping**
   ```typescript
   <ClientOnly fallback={<div>Loading...</div>}>
     <ClientDependentContent />
   </ClientOnly>
   ```

3. **Provide meaningful fallbacks**
   ```typescript
   <ClientOnly fallback={<Skeleton />}>
     <UserProfile />
   </ClientOnly>
   ```

4. **Keep server-safe content outside ClientOnly**
   ```typescript
   <div>
     <h1>Always visible title</h1>
     <ClientOnly>
       <DynamicContent />
     </ClientOnly>
   </div>
   ```

### ❌ Don't

1. **Don't use both patterns in the same component**
   ```typescript
   // Redundant
   const isClient = useClientSide();
   return (
     <ClientOnly>
       {isClient && <Content />}
     </ClientOnly>
   );
   ```

2. **Don't forget fallbacks for important content**
   ```typescript
   // Bad - no fallback
   <ClientOnly>
     <CriticalUserData />
   </ClientOnly>
   ```

3. **Don't wrap entire pages unnecessarily**
   ```typescript
   // Only wrap when needed
   <ClientOnly>
     <EntirePageContent />
   </ClientOnly>
   ```

## Migration Guide

### Step 1: Identify Problematic Components

Look for components that use:
- `useAuthGuard()` without client-side checks
- Redux state from localStorage
- `window`, `document`, `localStorage`
- Theme-dependent rendering

### Step 2: Choose the Right Pattern

- **Page components**: Use `useClientSide()` hook
- **Component parts**: Use `ClientOnly` wrapper
- **Entire components**: Wrap with `ClientOnly`

### Step 3: Implement Changes

1. Import the utility
2. Add client-side check
3. Provide appropriate fallback
4. Test for hydration errors

### Step 4: Verify

- Check browser console for hydration errors
- Test with slow network to see loading states
- Verify SSR still works correctly

## Troubleshooting

### Common Issues

#### 1. Still Getting Hydration Errors

**Cause**: Component not properly wrapped or using client-side APIs

**Solution**: 
- Check if all client-dependent code is wrapped
- Look for direct `localStorage` or `window` usage
- Ensure fallbacks are provided

#### 2. Content Flickers on Load

**Cause**: Fallback content is too different from client content

**Solution**:
- Make fallback content similar to client content
- Use skeleton loaders instead of empty states
- Consider using `suppressHydrationWarning` for theme-related content

#### 3. Performance Issues

**Cause**: Too many client-side checks

**Solution**:
- Use `ClientOnly` for granular control
- Avoid wrapping large components unnecessarily
- Consider lazy loading for heavy client components

### Debug Tools

1. **React DevTools**: Check for hydration warnings
2. **Browser Console**: Look for hydration error messages
3. **Network Tab**: Verify SSR content matches client

### Testing

```typescript
// Test that fallback renders on server
const { container } = render(<MyComponent />);
expect(container.textContent).toContain('Loading...');

// Test that client content renders after hydration
await waitFor(() => {
  expect(container.textContent).toContain('Client Content');
});
```

## Examples

See the following files for real-world implementations:

- `app/dashboard/page.tsx` - Page-level pattern
- `app/components/Cart/CartIcon.tsx` - Component-level pattern
- `app/components/Product/AddToCartButton.tsx` - Complex client state
- `app/components/Cart/CartSidebar.tsx` - Entire component wrapping

## Related Files

- `hooks/use-client-side.ts` - Main hook implementation
- `components/ClientOnly.tsx` - Component wrapper
- `app/components/theme-provider.tsx` - Theme-specific handling
- `lib/store/cartSlice.ts` - Redux store with localStorage
