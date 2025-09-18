# Troubleshooting Guide: Hydration Issues

This guide helps you diagnose and fix common hydration-related problems.

## Table of Contents

- [Common Error Messages](#common-error-messages)
- [Diagnostic Steps](#diagnostic-steps)
- [Specific Issues](#specific-issues)
- [Debug Tools](#debug-tools)
- [Prevention Tips](#prevention-tips)

## Common Error Messages

### 1. "Hydration failed because the server rendered HTML didn't match the client"

**What it means**: The HTML generated on the server doesn't match what React renders on the client.

**Common causes**:
- Authentication state differences
- localStorage/sessionStorage data
- Theme preferences
- Cart state
- Random values or timestamps

**Example**:
```
Warning: Text content did not match. Server: "Loading..." Client: "Welcome, John!"
```

### 2. "Cannot update a component while rendering a different component"

**What it means**: A component is trying to update state during the render phase.

**Common causes**:
- `router.push()` in render function
- State updates in render
- Side effects during rendering

**Example**:
```
Cannot update a component (Router) while rendering a different component (LoginPage)
```

### 3. "Warning: Expected server HTML to contain a matching element"

**What it means**: Server and client rendered different DOM structures.

**Common causes**:
- Conditional rendering based on client state
- Different components for server vs client
- Missing fallback content

## Diagnostic Steps

### Step 1: Identify the Problematic Component

1. **Check browser console** for specific error messages
2. **Look at the stack trace** to find the component
3. **Check React DevTools** for hydration warnings

### Step 2: Analyze the Component

Look for these patterns:

```typescript
// ❌ Problematic patterns
const data = localStorage.getItem('key'); // Server can't access
const user = useAuth(); // Different on server vs client
const theme = window.matchMedia('(prefers-color-scheme: dark)'); // Server can't access
const random = Math.random(); // Different each time
const now = new Date(); // Different timestamps
```

### Step 3: Check Server vs Client Rendering

```typescript
// Add debugging
console.log('Server:', typeof window === 'undefined');
console.log('Client:', typeof window !== 'undefined');
console.log('Data:', data);
```

### Step 4: Implement Fix

Choose the appropriate pattern:

- **Page components**: Use `useClientSide()` hook
- **Component parts**: Use `ClientOnly` wrapper
- **Entire components**: Wrap with `ClientOnly`

## Specific Issues

### Issue 1: Authentication State Mismatch

**Problem**: User appears logged out on server, logged in on client

**Symptoms**:
```
Server: "Please log in"
Client: "Welcome, John!"
```

**Root Cause**: `useAuthGuard()` returns different values on server vs client

**Solution**:
```typescript
// Before (Problematic)
function DashboardPage() {
  const { user, isAuthorized } = useAuthGuard();
  if (!isAuthorized) return <LoginPrompt />;
  return <Dashboard />;
}

// After (Fixed)
function DashboardPage() {
  const isClient = useClientSide();
  const { user, isAuthorized } = useAuthGuard();
  
  if (!isClient) return <LoadingSpinner />;
  if (!isAuthorized) return <LoginPrompt />;
  return <Dashboard />;
}
```

### Issue 2: Cart State Mismatch

**Problem**: Cart appears empty on server, has items on client

**Symptoms**:
```
Server: "Cart (0)"
Client: "Cart (3)"
```

**Root Cause**: Cart state loaded from localStorage differs between server/client

**Solution**:
```typescript
// Before (Problematic)
function CartIcon() {
  const cartItems = useAppSelector(state => state.cart.items);
  return <Badge>{cartItems.length}</Badge>;
}

// After (Fixed)
function CartIcon() {
  const cartItems = useAppSelector(state => state.cart.items);
  return (
    <ClientOnly>
      <Badge>{cartItems.length}</Badge>
    </ClientOnly>
  );
}
```

### Issue 3: Theme State Mismatch

**Problem**: Theme appears different on server vs client

**Symptoms**:
```
Server: Light theme
Client: Dark theme
```

**Root Cause**: Theme preference stored in localStorage

**Solution**:
```typescript
// Before (Problematic)
function ThemeToggle() {
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    setTheme(saved || 'light');
  }, []);
  
  return <button>{theme === 'light' ? '🌙' : '☀️'}</button>;
}

// After (Fixed)
function ThemeToggle() {
  const isClient = useClientSide();
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    if (isClient) {
      const saved = localStorage.getItem('theme');
      setTheme(saved || 'light');
    }
  }, [isClient]);
  
  if (!isClient) return <button>🌙</button>; // Default theme
  
  return <button>{theme === 'light' ? '🌙' : '☀️'}</button>;
}
```

### Issue 4: Random Values

**Problem**: Random values differ between server and client

**Symptoms**:
```
Server: "ID: 0.123456"
Client: "ID: 0.789012"
```

**Root Cause**: `Math.random()` or `Date.now()` called during render

**Solution**:
```typescript
// Before (Problematic)
function MyComponent() {
  const id = Math.random().toString(36);
  return <div id={id}>Content</div>;
}

// After (Fixed)
function MyComponent() {
  const isClient = useClientSide();
  const [id, setId] = useState('');
  
  useEffect(() => {
    if (isClient) {
      setId(Math.random().toString(36));
    }
  }, [isClient]);
  
  return <div id={id}>Content</div>;
}
```

### Issue 5: Router Navigation in Render

**Problem**: `router.push()` called during render

**Symptoms**:
```
Cannot update a component (Router) while rendering a different component
```

**Root Cause**: Navigation logic in render function

**Solution**:
```typescript
// Before (Problematic)
function LoginPage() {
  const { isAuthorized } = useAuthGuard();
  
  if (isAuthorized) {
    router.push('/dashboard'); // ❌ Called during render
  }
  
  return <LoginForm />;
}

// After (Fixed)
function LoginPage() {
  const isClient = useClientSide();
  const { isAuthorized } = useAuthGuard();
  
  useEffect(() => {
    if (isClient && isAuthorized) {
      router.push('/dashboard'); // ✅ Called in effect
    }
  }, [isClient, isAuthorized, router]);
  
  if (!isClient) return <LoadingSpinner />;
  if (isAuthorized) return <LoadingSpinner />;
  
  return <LoginForm />;
}
```

## Debug Tools

### 1. React DevTools

Install React DevTools browser extension:

1. **Components Tab**: Look for hydration warnings
2. **Profiler Tab**: Check for unnecessary re-renders
3. **Console Tab**: Look for error messages

### 2. Browser Console

Enable detailed logging:

```typescript
// Add to your app
if (typeof window !== 'undefined') {
  console.log('Client-side rendering');
} else {
  console.log('Server-side rendering');
}
```

### 3. Network Tab

1. **Slow 3G**: Test loading states
2. **Disable Cache**: Ensure fresh requests
3. **Check SSR**: Verify server responses

### 4. React Strict Mode

Enable in development:

```typescript
// next.config.js
module.exports = {
  reactStrictMode: true,
};
```

### 5. Custom Debug Hook

```typescript
// hooks/useDebugHydration.ts
import { useEffect } from 'react';

export function useDebugHydration(componentName: string) {
  useEffect(() => {
    console.log(`${componentName} hydrated on client`);
  }, [componentName]);
  
  if (typeof window === 'undefined') {
    console.log(`${componentName} rendering on server`);
  }
}
```

## Prevention Tips

### 1. Design for SSR

- **Assume no client state** during initial render
- **Provide meaningful fallbacks** for all client-dependent content
- **Use progressive enhancement** patterns

### 2. Consistent State Management

- **Initialize state consistently** on server and client
- **Use Redux with SSR support** when possible
- **Avoid localStorage** in initial state

### 3. Testing Strategy

```typescript
// Test SSR rendering
test('renders without errors on server', () => {
  const { container } = render(<MyComponent />);
  expect(container).toBeInTheDocument();
});

// Test client hydration
test('hydrates without errors', async () => {
  const { container } = render(<MyComponent />);
  
  await waitFor(() => {
    expect(container.querySelector('[data-testid="client-content"]')).toBeInTheDocument();
  });
});
```

### 4. Code Review Checklist

- [ ] No direct `localStorage` access in render
- [ ] No `window` or `document` usage in render
- [ ] No random values in render
- [ ] All client-dependent content wrapped
- [ ] Meaningful fallbacks provided
- [ ] No navigation in render functions

### 5. Monitoring

Set up monitoring for hydration errors:

```typescript
// Add error boundary
class HydrationErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    if (error.message.includes('Hydration')) {
      // Log to monitoring service
      console.error('Hydration error:', error, errorInfo);
    }
  }
}
```

## Quick Fixes

### Fix 1: Add Client Check

```typescript
// Quick fix for any component
const isClient = useClientSide();
if (!isClient) return <LoadingSpinner />;
```

### Fix 2: Wrap with ClientOnly

```typescript
// Quick fix for component parts
<ClientOnly fallback={<div>Loading...</div>}>
  <ClientDependentContent />
</ClientOnly>
```

### Fix 3: Suppress Warning (Last Resort)

```typescript
// Only use when absolutely necessary
<div suppressHydrationWarning>
  <ClientDependentContent />
</div>
```

## Getting Help

If you're still having issues:

1. **Check the console** for specific error messages
2. **Use React DevTools** to inspect components
3. **Test with slow network** to see loading states
4. **Review the migration guide** for patterns
5. **Check the API reference** for usage examples

## Related Documentation

- [Hydration Patterns Guide](./HYDRATION_PATTERNS.md)
- [API Reference](./API_REFERENCE.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
