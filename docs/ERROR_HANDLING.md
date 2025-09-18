# Error Handling System Documentation

This document describes the globalized error handling system implemented using Sonner from shadcn/ui.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
- [Error Types](#error-types)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Overview

The error handling system provides centralized error management with toast notifications throughout the application. It automatically categorizes errors and displays appropriate user-friendly messages.

### Key Features

- **Automatic Error Classification**: Detects error types and handles them appropriately
- **Toast Notifications**: User-friendly error messages using Sonner
- **Context Awareness**: Provides context about where errors occurred
- **Consistent UX**: Standardized error handling across the application
- **Developer Friendly**: Easy to use hooks and utilities

## Installation

The system is already set up in your application. It includes:

1. **Sonner Toast Component**: Added to root layout
2. **Error Handler Utility**: Centralized error handling logic
3. **React Hook**: Easy-to-use hook for components
4. **Type Definitions**: TypeScript support

## Usage

### Basic Usage

```typescript
import { useErrorHandler } from '@/hooks/use-error-handler';

function MyComponent() {
  const { handleError, success } = useErrorHandler();

  const handleAction = async () => {
    try {
      await someAsyncOperation();
      success('Operation completed successfully!');
    } catch (error) {
      handleError(error, 'My Action');
    }
  };

  return <button onClick={handleAction}>Do Something</button>;
}
```

### Direct Import Usage

```typescript
import { showError, showSuccess } from '@/lib/error-handler';

// In any function
try {
  await databaseOperation();
  showSuccess('Data saved successfully');
} catch (error) {
  showError(error, 'Database Operation');
}
```

## Error Types

### 1. Database Errors

Handles database-related errors with specific messaging.

```typescript
const { handleDatabaseError } = useErrorHandler();

try {
  await prisma.user.create(data);
} catch (error) {
  handleDatabaseError(error, 'User Creation');
}
```

**Common Database Error Messages**:
- Connection failures
- Timeout errors
- Constraint violations
- Resource not found

### 2. Authentication Errors

Handles login, registration, and auth-related errors.

```typescript
const { handleAuthError } = useErrorHandler();

try {
  await signIn('credentials', { email, password });
} catch (error) {
  handleAuthError(error, 'Login');
}
```

**Common Auth Error Messages**:
- Invalid credentials
- User not found
- Account locked
- Email not verified

### 3. Network Errors

Handles API calls, fetch requests, and network issues.

```typescript
const { handleNetworkError } = useErrorHandler();

try {
  const response = await fetch('/api/data');
  if (!response.ok) throw new Error('Network error');
} catch (error) {
  handleNetworkError(error, 'API Request');
}
```

**Common Network Error Messages**:
- Connection failed
- Request timeout
- Server unavailable

### 4. Validation Errors

Handles form validation and data validation errors.

```typescript
const { handleValidationError } = useErrorHandler();

try {
  validateFormData(data);
} catch (error) {
  handleValidationError(error, 'Form Submission');
}
```

### 5. Generic Errors

Handles any other type of error with automatic classification.

```typescript
const { handleError } = useErrorHandler();

try {
  await someOperation();
} catch (error) {
  handleError(error, 'Operation Name');
}
```

## API Reference

### ErrorHandler Class

#### `handleDatabaseError(error, context?)`
Handles database-related errors.

#### `handleAuthError(error, context?)`
Handles authentication-related errors.

#### `handleNetworkError(error, context?)`
Handles network-related errors.

#### `handleValidationError(error, context?)`
Handles validation-related errors.

#### `handleGenericError(error, context?)`
Handles generic errors.

#### `handleError(error, context?)`
Automatically detects error type and handles appropriately.

#### `showSuccess(message, details?)`
Shows success toast notification.

#### `showInfo(message, details?)`
Shows info toast notification.

#### `showWarning(message, details?)`
Shows warning toast notification.

### useErrorHandler Hook

Returns an object with all error handling methods:

```typescript
const {
  handleError,
  handleDatabaseError,
  handleAuthError,
  handleNetworkError,
  handleValidationError,
  success,
  info,
  warning
} = useErrorHandler();
```

## Examples

### Login Form Error Handling

```typescript
function LoginForm() {
  const { handleAuthError, success } = useErrorHandler();

  const handleSubmit = async (formData) => {
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        handleAuthError(new Error(result.error), 'Login');
      } else {
        success('Login successful', 'Welcome back!');
        router.push('/dashboard');
      }
    } catch (error) {
      handleAuthError(error, 'Login');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### API Data Fetching

```typescript
function ProductsList() {
  const { handleNetworkError, success } = useErrorHandler();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
        success('Products loaded', `${data.length} products available`);
      } catch (error) {
        handleNetworkError(error, 'Fetching Products');
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Form Validation

```typescript
function ContactForm() {
  const { handleValidationError, success } = useErrorHandler();

  const handleSubmit = async (formData) => {
    try {
      // Validate form data
      if (!formData.email) {
        throw new Error('Email is required');
      }
      if (!formData.message) {
        throw new Error('Message is required');
      }

      // Submit form
      await submitContactForm(formData);
      success('Message sent', 'Thank you for your message!');
    } catch (error) {
      handleValidationError(error, 'Contact Form');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### Cart Operations

```typescript
function AddToCartButton({ product }) {
  const { handleError, success } = useErrorHandler();
  const dispatch = useAppDispatch();

  const handleAddToCart = async () => {
    try {
      dispatch(addToCart({ product, quantity: 1 }));
      success('Added to cart', `${product.title} added successfully`);
    } catch (error) {
      handleError(error, 'Adding to Cart');
    }
  };

  return (
    <button onClick={handleAddToCart}>
      Add to Cart
    </button>
  );
}
```

## Best Practices

### ✅ Do

1. **Use appropriate error handlers**:
   ```typescript
   // Good - specific error type
   handleAuthError(error, 'Login');
   
   // Good - automatic detection
   handleError(error, 'Operation');
   ```

2. **Provide context**:
   ```typescript
   // Good - with context
   handleError(error, 'User Registration');
   
   // Avoid - without context
   handleError(error);
   ```

3. **Use success notifications**:
   ```typescript
   // Good - positive feedback
   success('Operation completed', 'Your data has been saved');
   ```

4. **Handle errors at the right level**:
   ```typescript
   // Good - handle in component
   const handleAction = async () => {
     try {
       await operation();
     } catch (error) {
       handleError(error, 'Action');
     }
   };
   ```

### ❌ Don't

1. **Don't ignore errors**:
   ```typescript
   // Bad - silent failure
   try {
     await operation();
   } catch (error) {
     // Ignored
   }
   ```

2. **Don't use generic handlers for specific errors**:
   ```typescript
   // Bad - generic for auth
   handleError(authError, 'Login');
   
   // Good - specific for auth
   handleAuthError(authError, 'Login');
   ```

3. **Don't show too many notifications**:
   ```typescript
   // Bad - excessive notifications
   success('Step 1 complete');
   success('Step 2 complete');
   success('Step 3 complete');
   
   // Good - single summary
   success('All steps completed successfully');
   ```

## Configuration

### Toast Settings

The system uses Sonner with these default settings:

- **Duration**: 3-5 seconds depending on error type
- **Position**: Top-right corner
- **Theme**: Follows app theme (dark/light)
- **Actions**: Retry buttons for network errors

### Customization

You can customize toast behavior by modifying the `ErrorHandler` class:

```typescript
// Custom duration
toast.error(message, {
  description: details,
  duration: 10000, // 10 seconds
});

// Custom action
toast.error(message, {
  description: details,
  action: {
    label: 'Retry',
    onClick: () => retryOperation(),
  },
});
```

## Testing

### Unit Tests

```typescript
import { renderHook } from '@testing-library/react';
import { useErrorHandler } from '@/hooks/use-error-handler';

test('handles database error', () => {
  const { result } = renderHook(() => useErrorHandler());
  
  // Mock console.error to avoid noise in tests
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  
  result.current.handleDatabaseError(new Error('Connection failed'), 'Test');
  
  expect(consoleSpy).toHaveBeenCalledWith('Database Error:', expect.any(Error));
  
  consoleSpy.mockRestore();
});
```

### Integration Tests

```typescript
import { render, screen } from '@testing-library/react';
import { toast } from 'sonner';

test('shows error toast on failure', async () => {
  render(<MyComponent />);
  
  // Trigger error
  fireEvent.click(screen.getByText('Trigger Error'));
  
  // Check if toast appears
  await waitFor(() => {
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Common Issues

1. **Toasts not appearing**:
   - Check if `<Toaster />` is added to layout
   - Verify Sonner is properly installed

2. **Errors not being caught**:
   - Ensure try-catch blocks are properly set up
   - Check if async functions are awaited

3. **Too many notifications**:
   - Review error handling logic
   - Consider debouncing or throttling

### Debug Mode

Enable debug logging:

```typescript
// In error-handler.ts
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Error handled:', { error, context, type });
}
```

## Related Files

- `lib/error-handler.ts` - Main error handling logic
- `hooks/use-error-handler.ts` - React hook
- `components/ui/sonner.tsx` - Toast component
- `app/layout.tsx` - Toaster setup
- `app/components/ErrorDemo.tsx` - Demo component

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team
