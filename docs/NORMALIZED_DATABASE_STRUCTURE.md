# Normalized Database Structure

This document describes the normalized database structure with separate Category and Brand tables.

## Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
- [Benefits of Normalization](#benefits-of-normalization)
- [API Changes](#api-changes)
- [Frontend Updates](#frontend-updates)
- [Migration Process](#migration-process)

## Overview

The database has been normalized to include separate `Category` and `Brand` tables instead of storing category and brand names as strings in the Product table. This provides better data integrity, consistency, and flexibility.

### Key Changes

- **Category Table**: Separate table for product categories
- **Brand Table**: Separate table for product brands
- **Foreign Keys**: Products now reference Category and Brand by ID
- **Slugs**: Added URL-friendly slugs for categories and products
- **SKU Support**: Added SKU field for product identification
- **Active Status**: Added isActive flags for soft deletion

## Database Schema

### Category Model

```prisma
model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  description String?
  slug        String    @unique
  image       String?
  isActive    Boolean   @default(true)
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**Fields:**
- `id`: Unique identifier
- `name`: Category name (e.g., "Electronics", "Fashion")
- `description`: Optional category description
- `slug`: URL-friendly identifier (e.g., "electronics", "fashion")
- `image`: Optional category image
- `isActive`: Soft delete flag
- `products`: One-to-many relationship with products

### Brand Model

```prisma
model Brand {
  id          String    @id @default(cuid())
  name        String    @unique
  description String?
  logo        String?
  website     String?
  isActive    Boolean   @default(true)
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**Fields:**
- `id`: Unique identifier
- `name`: Brand name (e.g., "Apple", "Nike")
- `description`: Optional brand description
- `logo`: Optional brand logo URL
- `website`: Optional brand website
- `isActive`: Soft delete flag
- `products`: One-to-many relationship with products

### Updated Product Model

```prisma
model Product {
  id                String   @id @default(cuid())
  title             String
  description       String
  price             Float
  discountPercentage Float   @default(0)
  rating            Float   @default(0)
  stock             Int     @default(0)
  sku               String? @unique
  slug              String  @unique
  thumbnail         String?
  images            String[] @default([])
  tags              String[] @default([])
  isActive          Boolean  @default(true)
  categoryId        String
  brandId           String
  category          Category @relation(fields: [categoryId], references: [id])
  brand             Brand    @relation(fields: [brandId], references: [id])
  reviews           Review[]
  cartItems         CartItem[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

**New Fields:**
- `sku`: Stock Keeping Unit (optional, unique)
- `slug`: URL-friendly identifier
- `isActive`: Soft delete flag
- `categoryId`: Foreign key to Category
- `brandId`: Foreign key to Brand
- `category`: Category relation
- `brand`: Brand relation

## Benefits of Normalization

### 1. Data Integrity
- **Referential Integrity**: Foreign key constraints prevent orphaned records
- **Consistency**: Category and brand names are consistent across all products
- **Validation**: Database enforces valid category and brand references

### 2. Performance
- **Indexing**: Better query performance with proper indexes
- **Storage**: Reduced storage by avoiding duplicate strings
- **Joins**: Efficient joins for filtering and searching

### 3. Flexibility
- **Metadata**: Categories and brands can have additional metadata
- **Hierarchy**: Easy to add category hierarchies in the future
- **Management**: Centralized management of categories and brands

### 4. SEO and URLs
- **Slugs**: URL-friendly identifiers for better SEO
- **Consistency**: Consistent URL structure across the application

## API Changes

### Updated Product Endpoints

#### GET /api/products
Now includes category and brand relations:

```json
{
  "products": [
    {
      "id": "string",
      "title": "iPhone 15 Pro",
      "category": {
        "id": "cat_electronics",
        "name": "Electronics",
        "slug": "electronics"
      },
      "brand": {
        "id": "brand_apple",
        "name": "Apple",
        "logo": "https://example.com/apple-logo.png"
      }
    }
  ]
}
```

#### POST /api/products
Now requires categoryId and brandId:

```json
{
  "title": "New Product",
  "description": "Product description",
  "price": 99.99,
  "categoryId": "cat_electronics",
  "brandId": "brand_apple",
  "sku": "PROD-001"
}
```

### New Endpoints

#### GET /api/categories
Fetch all categories:

```json
[
  {
    "id": "cat_electronics",
    "name": "Electronics",
    "description": "Electronic devices and gadgets",
    "slug": "electronics",
    "isActive": true
  }
]
```

#### GET /api/brands
Fetch all brands:

```json
[
  {
    "id": "brand_apple",
    "name": "Apple",
    "description": "Technology company",
    "logo": "https://example.com/apple-logo.png",
    "isActive": true
  }
]
```

## Frontend Updates

### Updated TypeScript Types

```typescript
export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  sku?: string;
  slug: string;
  thumbnail?: string;
  images: string[];
  tags: string[];
  isActive: boolean;
  categoryId: string;
  brandId: string;
  category: Category;
  brand: Brand;
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}
```

### Updated Components

#### ProductCard Component
```typescript
// Before
<ProductBadges category={product.category} brand={product.brand} />

// After
<ProductBadges category={product.category.name} brand={product.brand.name} />
```

#### Admin Page
```typescript
// Before
<td>{product.category}</td>
<td>{product.brand}</td>

// After
<td>{product.category.name}</td>
<td>{product.brand.name}</td>
```

## Migration Process

### 1. Schema Update
- Added Category and Brand models
- Updated Product model with foreign keys
- Added new fields (sku, slug, isActive)

### 2. Data Migration
- Created default categories and brands
- Migrated existing product data
- Generated slugs for all products
- Updated foreign key references

### 3. API Updates
- Updated all product endpoints
- Added category and brand endpoints
- Updated filtering logic
- Added relation includes

### 4. Frontend Updates
- Updated TypeScript types
- Modified component props
- Updated admin interface
- Fixed product display logic

## Sample Data

### Categories
- Electronics
- Computers
- Audio
- Fashion
- Home & Kitchen

### Brands
- Apple
- Samsung
- Dell
- Sony
- Nike
- Adidas
- Levi's
- Uniqlo
- KitchenAid
- Dyson

## Usage Examples

### Fetch Products with Relations
```typescript
const products = await ProductAPI.getProducts({
  page: 1,
  limit: 12,
  category: 'Electronics',
  brand: 'Apple'
});
```

### Create New Product
```typescript
const product = await ProductAPI.createProduct({
  title: 'New iPhone',
  description: 'Latest iPhone model',
  price: 999.99,
  categoryId: 'cat_electronics',
  brandId: 'brand_apple',
  sku: 'IPHONE-15-PRO'
});
```

### Filter by Category
```typescript
const electronics = await ProductAPI.getProductsByCategory('Electronics');
```

### Filter by Brand
```typescript
const appleProducts = await ProductAPI.getProductsByBrand('Apple');
```

## Future Enhancements

### Category Hierarchy
```prisma
model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  parentId    String?
  parent      Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  // ... other fields
}
```

### Brand Categories
```prisma
model Brand {
  id          String    @id @default(cuid())
  name        String    @unique
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])
  // ... other fields
}
```

### Product Variants
```prisma
model ProductVariant {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  name      String   // e.g., "Color", "Size"
  value     String   // e.g., "Red", "Large"
  sku       String?  @unique
  price     Float?
  stock     Int      @default(0)
}
```

## Performance Considerations

### Indexing Strategy
```sql
-- Category indexes
CREATE INDEX idx_category_name ON "Category"("name");
CREATE INDEX idx_category_slug ON "Category"("slug");
CREATE INDEX idx_category_active ON "Category"("isActive");

-- Brand indexes
CREATE INDEX idx_brand_name ON "Brand"("name");
CREATE INDEX idx_brand_active ON "Brand"("isActive");

-- Product indexes
CREATE INDEX idx_product_category ON "Product"("categoryId");
CREATE INDEX idx_product_brand ON "Product"("brandId");
CREATE INDEX idx_product_slug ON "Product"("slug");
CREATE INDEX idx_product_sku ON "Product"("sku");
CREATE INDEX idx_product_active ON "Product"("isActive");
```

### Query Optimization
```typescript
// Efficient product query with relations
const products = await prisma.product.findMany({
  where: { isActive: true },
  include: {
    category: { select: { name: true, slug: true } },
    brand: { select: { name: true, logo: true } },
    reviews: { select: { rating: true } }
  },
  orderBy: { createdAt: 'desc' }
});
```

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Maintainer**: Development Team
