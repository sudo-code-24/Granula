# Database Seeding Scripts

This directory contains scripts to seed the database with initial data for development and testing.

## Available Scripts

### Individual Seeding Scripts

#### `seed-users.ts`
Seeds the database with users, roles, and profiles.

**Usage:**
```bash
npm run seed:users
# or
npx tsx scripts/seed-users.ts
```

**Creates:**
- 3 roles (admin, user, manager)
- 7 users with different roles
- 5 user profiles with detailed information

**Login Credentials:**
- Admin: `admin@granula.com` / `admin123`
- Manager: `manager@granula.com` / `password123`
- User: `user@granula.com` / `password123`
- Test: `test@granula.com` / `password123`
- Demo: `demo@granula.com` / `password123`
- Simple: `simple@granula.com` / `password123`
- Basic: `basic@granula.com` / `password123`

#### `seed-products.ts`
Seeds the database with products, categories, and brands.

**Usage:**
```bash
npm run seed:products
# or
npx tsx scripts/seed-products.ts
```

**Creates:**
- 5 categories (Electronics, Clothing, Home & Garden, Sports, Books)
- 5 brands (Apple, Samsung, Nike, Adidas, Sony)
- 20+ products with full details, images, and relationships

#### `seed-all.ts`
Comprehensive seeding script that creates all data types.

**Usage:**
```bash
npm run seed:all
# or
npx tsx scripts/seed-all.ts
```

**Creates:**
- All roles, users, and profiles
- All categories and brands
- Sample products with relationships
- Complete database setup for development

## Database Schema

### Roles
- **admin** (level: 100) - Full system access
- **manager** (level: 50) - Elevated permissions
- **user** (level: 10) - Standard user access

### Users
Each user includes:
- Email and hashed password
- Role assignment
- Optional profile with personal details
- Automatic cart creation

### Categories
- Electronics
- Clothing
- Home & Garden
- Sports
- Books

### Brands
- Apple
- Samsung
- Nike
- Adidas
- Sony

### Products
Sample products include:
- Smartphones (iPhone 15 Pro, Galaxy S24 Ultra)
- Headphones (Sony WH-1000XM5)
- Shoes (Nike Air Max 270, Adidas Ultraboost 22)
- And more...

## Prerequisites

1. **Database Setup**: Ensure PostgreSQL is running and configured
2. **Environment Variables**: Set `DATABASE_URL` in `.env`
3. **Prisma Client**: Run `npx prisma generate` before seeding
4. **Dependencies**: Install with `npm install`

## Running Seeding Scripts

### Quick Start
```bash
# Generate Prisma client
npx prisma generate

# Seed everything
npm run seed:all
```

### Step by Step
```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Run migrations (if needed)
npx prisma migrate dev

# 3. Seed users
npm run seed:users

# 4. Seed products
npm run seed:products

# 5. Or seed everything at once
npm run seed:all
```

## Script Features

### Error Handling
- Comprehensive error handling and logging
- Graceful failure with detailed error messages
- Database connection cleanup

### Data Integrity
- Uses `upsert` operations to prevent duplicates
- Maintains referential integrity
- Handles existing data gracefully

### Logging
- Detailed progress logging
- Summary statistics
- Clear success/failure indicators

### Security
- Passwords are properly hashed with bcrypt
- Uses secure salt rounds (12)
- No plain text passwords in logs

## Customization

### Adding New Users
Edit `scripts/seed-users.ts` and add to the `users` array:

```typescript
{
  email: 'newuser@granula.com',
  password: hashedPassword,
  roleId: userRole.id,
  profile: {
    firstName: 'New',
    lastName: 'User',
    // ... other profile fields
  },
}
```

### Adding New Products
Edit `scripts/seed-products.ts` and add to the `products` array:

```typescript
{
  title: 'New Product',
  description: 'Product description',
  price: 99.99,
  // ... other product fields
  categoryId: category.id,
  brandId: brand.id,
}
```

### Adding New Categories/Brands
Edit the respective arrays in the seeding scripts to add new categories or brands.

## Troubleshooting

### Common Issues

1. **Prisma Client Not Generated**
   ```bash
   npx prisma generate
   ```

2. **Database Connection Issues**
   - Check `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Verify database exists

3. **Migration Issues**
   ```bash
   npx prisma migrate dev
   ```

4. **Permission Issues**
   - Ensure database user has proper permissions
   - Check database connection settings

### Reset Database
If you need to reset the database:

```bash
# Reset database (WARNING: This deletes all data)
npx prisma migrate reset

# Then re-seed
npm run seed:all
```

## Development Workflow

1. **Initial Setup**: Run `npm run seed:all` for complete setup
2. **Add Users**: Use `npm run seed:users` for new user accounts
3. **Add Products**: Use `npm run seed:products` for new product data
4. **Reset Data**: Use `npx prisma migrate reset` to start fresh

## Production Considerations

⚠️ **Warning**: These scripts are designed for development and testing only. Do not run them in production environments.

For production:
- Use proper data migration tools
- Implement secure user registration
- Use production-grade data sources
- Follow security best practices

---

**Last Updated**: January 2025  
**Maintainer**: Development Team