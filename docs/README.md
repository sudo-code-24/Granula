# Documentation: Hydration-Safe Patterns

This directory contains comprehensive documentation for implementing hydration-safe patterns in our Next.js application.

## 📚 Documentation Overview

### Core Documentation

- **[Hydration Patterns Guide](./HYDRATION_PATTERNS.md)** - Main guide covering patterns, utilities, and best practices
- **[API Reference](./API_REFERENCE.md)** - Detailed API documentation for `useClientSide` hook and `ClientOnly` component
- **[Migration Guide](./MIGRATION_GUIDE.md)** - Step-by-step guide for migrating existing components
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Common issues, solutions, and debugging techniques

## 🚀 Quick Start

### For New Components

```typescript
import { useClientSide } from '@/hooks/use-client-side';
import { ClientOnly } from '@/components/ClientOnly';

// Page-level pattern
function MyPage() {
  const isClient = useClientSide();
  if (!isClient) return <LoadingSpinner />;
  // ... rest of component
}

// Component-level pattern
function MyComponent() {
  return (
    <div>
      <h1>Always visible</h1>
      <ClientOnly fallback={<div>Loading...</div>}>
        <ClientDependentContent />
      </ClientOnly>
    </div>
  );
}
```

### For Existing Components

1. **Identify** components with hydration issues
2. **Choose** appropriate pattern (hook vs component)
3. **Implement** client-side checks
4. **Test** for hydration errors
5. **Verify** SSR still works

## 🛠️ Available Utilities

### `useClientSide` Hook

```typescript
const isClient = useClientSide();
// Returns: false during SSR, true after hydration
```

**Use for**: Page-level client-side detection

### `ClientOnly` Component

```typescript
<ClientOnly fallback={<div>Loading...</div>}>
  <ClientDependentContent />
</ClientOnly>
```

**Use for**: Component-level client-side rendering

## 📋 Common Patterns

### Authentication Pages

```typescript
function ProtectedPage() {
  const isClient = useClientSide();
  const { user, isAuthorized } = useAuth();
  
  if (!isClient) return <LoadingSpinner />;
  if (!isAuthorized) return <UnauthorizedAccess />;
  
  return <ProtectedContent />;
}
```

### Cart Components

```typescript
function CartIcon() {
  const cartItems = useAppSelector(state => state.cart.items);
  
  return (
    <Button>
      <ShoppingCart />
      <ClientOnly>
        {cartItems.length > 0 && <Badge>{cartItems.length}</Badge>}
      </ClientOnly>
    </Button>
  );
}
```

### Theme Components

```typescript
function ThemeToggle() {
  const isClient = useClientSide();
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    if (isClient) {
      setTheme(localStorage.getItem('theme') || 'light');
    }
  }, [isClient]);
  
  if (!isClient) return <DefaultThemeIcon />;
  
  return <ThemeIcon theme={theme} />;
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Hydration errors**: Server/client HTML mismatch
2. **Content flickering**: Fallback too different from client content
3. **Performance issues**: Too many client-side checks
4. **TypeScript errors**: Missing type definitions

### Quick Fixes

```typescript
// Fix 1: Add client check
const isClient = useClientSide();
if (!isClient) return <LoadingSpinner />;

// Fix 2: Wrap with ClientOnly
<ClientOnly fallback={<div>Loading...</div>}>
  <ClientContent />
</ClientOnly>

// Fix 3: Suppress warning (last resort)
<div suppressHydrationWarning>
  <ClientContent />
</div>
```

## 📖 Reading Order

### For New Team Members

1. Start with [Hydration Patterns Guide](./HYDRATION_PATTERNS.md)
2. Review [API Reference](./API_REFERENCE.md) for specific usage
3. Check [Troubleshooting Guide](./TROUBLESHOOTING.md) for common issues

### For Migration Projects

1. Read [Migration Guide](./MIGRATION_GUIDE.md) first
2. Use [API Reference](./API_REFERENCE.md) for implementation details
3. Refer to [Troubleshooting Guide](./TROUBLESHOOTING.md) for issues

### For Debugging

1. Check [Troubleshooting Guide](./TROUBLESHOOTING.md) for specific errors
2. Review [Hydration Patterns Guide](./HYDRATION_PATTERNS.md) for patterns
3. Use [API Reference](./API_REFERENCE.md) for correct usage

## 🎯 Best Practices

### ✅ Do

- Use `useClientSide()` for page-level checks
- Use `ClientOnly` for component-level wrapping
- Provide meaningful fallbacks
- Test with slow network connections
- Monitor for hydration errors in production

### ❌ Don't

- Use both patterns in the same component
- Forget fallbacks for important content
- Wrap entire pages unnecessarily
- Use `suppressHydrationWarning` as first solution
- Ignore hydration errors

## 🔗 Related Files

### Implementation Files

- `hooks/use-client-side.ts` - Main hook implementation
- `components/ClientOnly.tsx` - Component wrapper
- `app/components/theme-provider.tsx` - Theme-specific handling

### Example Files

- `app/dashboard/page.tsx` - Page-level pattern example
- `app/components/Cart/CartIcon.tsx` - Component-level pattern example
- `app/components/Product/AddToCartButton.tsx` - Complex client state example

## 📝 Contributing

When adding new components or patterns:

1. **Follow** established patterns
2. **Document** any new patterns
3. **Test** for hydration issues
4. **Update** relevant documentation
5. **Review** with team members

## 🆘 Getting Help

If you need help:

1. **Check** the troubleshooting guide first
2. **Search** existing issues in the codebase
3. **Ask** team members for guidance
4. **Create** a new issue with details
5. **Reference** this documentation

## 📊 Metrics

Track these metrics to ensure success:

- **Hydration errors**: Should be zero
- **Performance**: No significant impact
- **User experience**: Smooth loading states
- **Code maintainability**: Consistent patterns
- **Team adoption**: All developers using patterns

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team
