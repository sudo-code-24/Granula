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
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname === "/unauthorized" && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Role-based access control (optional)
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

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
