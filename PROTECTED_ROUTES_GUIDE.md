# Protected Routes with Middleware Guide

This guide explains how to implement protected routes in your Next.js application using middleware and NextAuth.js.

## Overview

The middleware approach provides server-side protection for your routes, ensuring that unauthorized users are redirected before the page even loads. This is more secure than client-side protection alone.

## Files Created/Modified

### 1. `middleware.ts` (Root Level)
This is the main middleware file that handles route protection:

```typescript
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Define protected routes
    const protectedRoutes = ["/dashboard", "/profile"];
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    );

    // If accessing a protected route without authentication
    if (isProtectedRoute && !token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Role-based access control
    if (pathname.startsWith("/admin") && token?.role?.name !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to public routes
        const publicRoutes = ["/", "/login", "/contact", "/api/auth"];
        const isPublicRoute = publicRoutes.some(route => 
          pathname.startsWith(route)
        );
        
        if (isPublicRoute) {
          return true;
        }

        // For protected routes, require authentication
        return !!token;
      },
    },
  }
);
```

### 2. Updated Pages
- `app/dashboard/page.tsx` - Now uses authentication
- `app/profile/page.tsx` - Now uses authentication  
- `app/admin/page.tsx` - Example of role-based protection

## How It Works

### 1. Route Protection Levels

#### Basic Authentication
```typescript
// In middleware.ts
const protectedRoutes = ["/dashboard", "/profile"];
const isProtectedRoute = protectedRoutes.some(route => 
  pathname.startsWith(route)
);

if (isProtectedRoute && !token) {
  return NextResponse.redirect(new URL("/login", req.url));
}
```

#### Role-Based Access Control
```typescript
// In middleware.ts
if (pathname.startsWith("/admin") && token?.role?.name !== "admin") {
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
```

### 2. Client-Side Protection
Each protected page also includes client-side checks:

```typescript
"use client";
import { useAuth } from '@/lib/useAuth';

export default function ProtectedPage() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AccessDenied />;
  }

  return <PageContent />;
}
```

## Configuration

### 1. Middleware Configuration
The `config` object defines which paths the middleware should run on:

```typescript
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
```

### 2. Adding New Protected Routes
To add new protected routes, update the `protectedRoutes` array in `middleware.ts`:

```typescript
const protectedRoutes = ["/dashboard", "/profile", "/settings", "/billing"];
```

### 3. Adding Role-Based Routes
For role-based protection, add conditions in the middleware:

```typescript
// Example: Only moderators and admins can access /moderation
if (pathname.startsWith("/moderation")) {
  const allowedRoles = ["moderator", "admin"];
  if (!allowedRoles.includes(token?.role?.name)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
}
```

## Best Practices

### 1. Double Protection
- Use middleware for server-side protection
- Use client-side checks for better UX (loading states, etc.)

### 2. Error Handling
- Provide clear error messages for unauthorized access
- Redirect to appropriate pages based on user state

### 3. Performance
- Middleware runs on every request, so keep it lightweight
- Use the `matcher` config to exclude unnecessary paths

### 4. Security
- Never rely solely on client-side protection
- Always validate permissions on the server side
- Use HTTPS in production

## Testing Your Implementation

1. **Test Unauthenticated Access:**
   - Visit `/dashboard` without logging in
   - Should redirect to `/login`

2. **Test Authenticated Access:**
   - Log in and visit `/dashboard`
   - Should show the dashboard content

3. **Test Role-Based Access:**
   - Log in as a regular user and visit `/admin`
   - Should redirect to `/dashboard` or show access denied

4. **Test Public Routes:**
   - Visit `/` and `/contact` without logging in
   - Should work normally

## Troubleshooting

### Common Issues

1. **Middleware not running:**
   - Check the `matcher` configuration
   - Ensure the file is named `middleware.ts` in the root directory

2. **Infinite redirects:**
   - Check that public routes are properly excluded
   - Verify the redirect URLs are correct

3. **Token not available:**
   - Ensure NextAuth.js is properly configured
   - Check that the session strategy is set to "jwt"

### Debug Tips

Add console logs to debug middleware behavior:

```typescript
export default withAuth(
  function middleware(req) {
    console.log('Path:', req.nextUrl.pathname);
    console.log('Token:', !!req.nextauth.token);
    // ... rest of your logic
  }
);
```

## Next Steps

1. Customize the protected routes for your application
2. Add more role-based access controls as needed
3. Implement additional security measures (rate limiting, etc.)
4. Add proper error pages for better UX
5. Consider implementing API route protection as well
