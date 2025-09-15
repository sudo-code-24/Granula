# Authentication System Setup Guide

This project implements credential-based authentication using NextAuth.js with a PostgreSQL database and Prisma ORM.

## Features

- ✅ Email/password authentication
- ✅ Role-based access control
- ✅ User profiles with extended information
- ✅ Secure password hashing with bcrypt
- ✅ JWT-based sessions
- ✅ TypeScript support with proper type definitions

## Prerequisites

1. **Database**: PostgreSQL database running
2. **Environment Variables**: Set up your `.env.local` file
3. **Dependencies**: All required packages are installed

## Environment Setup

Create a `.env.local` file in your project root with:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/granula?schema=public"
```

**Important**: Change the `NEXTAUTH_SECRET` to a secure random string in production!

## Database Setup

1. **Run migrations**:
   ```bash
   npx prisma migrate dev
   ```

2. **Seed the database** with initial data:
   ```bash
   npm run seed
   ```

This will create:
- Admin role (level 100)
- User role (level 10)
- Test admin user: `admin@granula.com` / `admin123`
- Test regular user: `user@granula.com` / `user123`

## Usage

### Authentication in Components

```tsx
import { useSession, signIn, signOut } from "next-auth/react";

export default function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;
  
  if (status === "unauthenticated") {
    return (
      <button onClick={() => signIn()}>Sign In</button>
    );
  }

  return (
    <div>
      <p>Welcome, {session.user.email}!</p>
      <p>Role: {session.user.role.name}</p>
      <p>Department: {session.user.profile?.department}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### Protected Routes

```tsx
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function ProtectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return null;

  return (
    <div>
      <h1>Protected Content</h1>
      <p>Hello, {session.user.email}!</p>
    </div>
  );
}
```

### Role-Based Access Control

```tsx
import { useSession } from "next-auth/react";

export default function AdminOnlyComponent() {
  const { data: session } = useSession();

  // Check if user has admin role
  if (session?.user.role.level < 100) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Welcome to the admin area!</p>
    </div>
  );
}
```

### Creating New Users

```tsx
import { createUser } from "@/lib/auth";

// In your API route or server action
const newUser = await createUser(
  "newuser@granula.com",
  "securepassword123",
  "role-id-here"
);
```

## API Routes

The authentication system provides these endpoints:

- `POST /api/auth/signin` - Sign in with credentials
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session
- `GET /api/auth/csrf` - Get CSRF token

## Security Features

- **Password Hashing**: Uses bcrypt with 12 salt rounds
- **JWT Sessions**: Secure token-based sessions
- **CSRF Protection**: Built-in CSRF protection
- **Input Validation**: Proper validation of credentials
- **Error Handling**: Secure error messages without information leakage

## Customization

### Adding New User Fields

1. Update your Prisma schema
2. Run `npx prisma migrate dev`
3. Update the types in `types/next-auth.d.ts`
4. Modify the auth callbacks in `app/api/auth/[...nextauth]/route.ts`

### Adding New Authentication Providers

```tsx
import GoogleProvider from "next-auth/providers/google";

// Add to providers array
providers: [
  CredentialsProvider({...}),
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
]
```

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**: Ensure Prisma client is generated
2. **Database connection errors**: Check your DATABASE_URL
3. **Authentication not working**: Verify NEXTAUTH_SECRET is set
4. **Type errors**: Make sure types/next-auth.d.ts is properly configured

### Debug Mode

Enable debug mode by adding to your `.env.local`:

```bash
NEXTAUTH_DEBUG=true
```

## Production Considerations

1. **Change NEXTAUTH_SECRET** to a secure random string
2. **Use HTTPS** in production
3. **Set proper NEXTAUTH_URL** for your domain
4. **Configure database connection pooling**
5. **Set up proper logging and monitoring**

## Support

For issues related to:
- **NextAuth.js**: Check [NextAuth.js documentation](https://next-auth.js.org/)
- **Prisma**: Check [Prisma documentation](https://www.prisma.io/docs/)
- **Database**: Check your PostgreSQL configuration
