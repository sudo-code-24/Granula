# API Reference

This document provides detailed API documentation for the hydration-safe utilities.

## Table of Contents

- [useClientSide Hook](#useclientside-hook)
- [ClientOnly Component](#clientonly-component)
- [Type Definitions](#type-definitions)
- [Examples](#examples)

## useClientSide Hook

### Import

```typescript
import { useClientSide } from '@/hooks/use-client-side';
```

### Signature

```typescript
function useClientSide(): boolean
```

### Description

A custom React hook that detects whether the component is currently running on the client side. This is essential for preventing hydration mismatches when components depend on client-side only APIs or state.

### Returns

- **Type**: `boolean`
- **Description**: 
  - `false` during server-side rendering (SSR)
  - `true` after the component has mounted on the client

### Behavior

1. **Initial Render (SSR)**: Returns `false`
2. **After Hydration**: Returns `true`
3. **Re-renders**: Always returns `true` once client-side

### Usage Examples

#### Basic Usage

```typescript
function MyComponent() {
  const isClient = useClientSide();
  
  if (!isClient) {
    return <div>Loading...</div>;
  }
  
  return <div>Client content</div>;
}
```

#### With Authentication

```typescript
function ProtectedPage() {
  const isClient = useClientSide();
  const { user, isLoading } = useAuth();
  
  if (!isClient) return <LoadingSpinner />;
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <LoginPrompt />;
  
  return <Dashboard />;
}
```

#### With Local Storage

```typescript
function CartSummary() {
  const isClient = useClientSide();
  const [cartItems, setCartItems] = useState([]);
  
  useEffect(() => {
    if (isClient) {
      const saved = localStorage.getItem('cart');
      setCartItems(JSON.parse(saved || '[]'));
    }
  }, [isClient]);
  
  if (!isClient) return <div>Loading cart...</div>;
  
  return <div>Cart: {cartItems.length} items</div>;
}
```

### Performance Considerations

- **Lightweight**: Minimal overhead, only manages a single boolean state
- **No Re-renders**: Only triggers one re-render when transitioning from server to client
- **Memory Efficient**: No cleanup required

### Common Patterns

#### Pattern 1: Early Return

```typescript
function Component() {
  const isClient = useClientSide();
  
  if (!isClient) return <Fallback />;
  
  // Rest of component logic
}
```

#### Pattern 2: Conditional Rendering

```typescript
function Component() {
  const isClient = useClientSide();
  
  return (
    <div>
      <h1>Always visible</h1>
      {isClient && <ClientOnlyContent />}
    </div>
  );
}
```

## ClientOnly Component

### Import

```typescript
import { ClientOnly } from '@/components/ClientOnly';
```

### Props

```typescript
interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

### Description

A wrapper component that only renders its children on the client side. During server-side rendering, it renders the fallback content instead. This prevents hydration mismatches for components that depend on client-side state or APIs.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `React.ReactNode` | ✅ | - | Content to render on client side |
| `fallback` | `React.ReactNode` | ❌ | `null` | Content to render during SSR |

### Usage Examples

#### Basic Usage

```typescript
function MyComponent() {
  return (
    <div>
      <h1>Always visible</h1>
      <ClientOnly>
        <div>Only on client</div>
      </ClientOnly>
    </div>
  );
}
```

#### With Fallback

```typescript
function UserProfile() {
  return (
    <ClientOnly fallback={<UserProfileSkeleton />}>
      <UserProfileContent />
    </ClientOnly>
  );
}
```

#### With Loading State

```typescript
function CartIcon() {
  return (
    <Button>
      <ShoppingCart />
      <ClientOnly fallback={null}>
        <CartBadge />
      </ClientOnly>
    </Button>
  );
}
```

#### Complex Content

```typescript
function Dashboard() {
  return (
    <div>
      <Header />
      <ClientOnly fallback={<DashboardSkeleton />}>
        <DashboardContent />
        <UserWidgets />
        <Analytics />
      </ClientOnly>
    </div>
  );
}
```

### Behavior

1. **Server-Side Rendering**: Renders `fallback` prop or `null`
2. **Client-Side Hydration**: Renders `children` prop
3. **Re-renders**: Always renders `children` after initial hydration

### Performance Considerations

- **No Re-renders**: Only renders once when transitioning from server to client
- **Memory Efficient**: No internal state management
- **Lightweight**: Minimal wrapper component

### Best Practices

#### ✅ Good Usage

```typescript
// Granular wrapping
<div>
  <h1>Title</h1>
  <ClientOnly fallback={<div>Loading...</div>}>
    <DynamicContent />
  </ClientOnly>
</div>

// Meaningful fallback
<ClientOnly fallback={<UserCardSkeleton />}>
  <UserCard />
</ClientOnly>
```

#### ❌ Avoid

```typescript
// Unnecessary wrapping
<ClientOnly>
  <EntirePage />
</ClientOnly>

// No fallback for important content
<ClientOnly>
  <CriticalUserData />
</ClientOnly>

// Redundant with useClientSide
const isClient = useClientSide();
<ClientOnly>
  {isClient && <Content />}
</ClientOnly>
```

## Type Definitions

### ClientOnlyProps

```typescript
interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

### Hook Return Type

```typescript
// useClientSide return type
type UseClientSideReturn = boolean;
```

## Examples

### Complete Page Example

```typescript
import { useClientSide } from '@/hooks/use-client-side';
import { ClientOnly } from '@/components/ClientOnly';

export default function ProductsPage() {
  const isClient = useClientSide();
  const { user, isLoading, isAuthorized } = useAuthGuard();
  
  // Page-level client check
  if (!isClient) return <LoadingSpinner />;
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthorized) return <UnauthorizedAccess />;
  
  return (
    <div>
      <h1>Products</h1>
      
      {/* Component-level client check */}
      <ClientOnly fallback={<ProductListSkeleton />}>
        <ProductList />
      </ClientOnly>
      
      <ClientOnly>
        <CartSummary />
      </ClientOnly>
    </div>
  );
}
```

### Cart Component Example

```typescript
import { ClientOnly } from '@/components/ClientOnly';

export default function CartIcon() {
  const cartItems = useAppSelector(state => state.cart.items);
  const cartCount = cartItems.length;
  
  return (
    <Button>
      <ShoppingCart />
      <ClientOnly>
        {cartCount > 0 && (
          <Badge>{cartCount}</Badge>
        )}
      </ClientOnly>
    </Button>
  );
}
```

### Theme-Aware Component Example

```typescript
import { useClientSide } from '@/hooks/use-client-side';

export default function ThemeToggle() {
  const isClient = useClientSide();
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    if (isClient) {
      setTheme(localStorage.getItem('theme') || 'light');
    }
  }, [isClient]);
  
  if (!isClient) {
    return <div>🌙</div>; // Default theme icon
  }
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

## Migration Examples

### Before (Problematic)

```typescript
function MyComponent() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) return <Loading />;
  
  return <ClientContent />;
}
```

### After (Using Hook)

```typescript
function MyComponent() {
  const isClient = useClientSide();
  
  if (!isClient) return <Loading />;
  
  return <ClientContent />;
}
```

### After (Using Component)

```typescript
function MyComponent() {
  return (
    <ClientOnly fallback={<Loading />}>
      <ClientContent />
    </ClientOnly>
  );
}
```

## Related Documentation

- [Hydration Patterns Guide](./HYDRATION_PATTERNS.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
