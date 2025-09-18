# Database Products Implementation

This document describes the complete implementation of database-driven products instead of the dummy API.

## Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Frontend Integration](#frontend-integration)
- [Admin Interface](#admin-interface)
- [Usage Examples](#usage-examples)

## Overview

The application has been updated to use a PostgreSQL database for product management instead of the external dummy API. This provides:

- **Data Persistence**: Products are stored in the database
- **Full CRUD Operations**: Create, Read, Update, Delete products
- **Advanced Filtering**: Search, category, brand, price range filtering
- **Pagination**: Server-side pagination for better performance
- **Admin Management**: Admin interface to view and manage products
- **Error Handling**: Comprehensive error handling with toast notifications

## Database Schema

### Product Model

```prisma
model Product {
  id                String   @id @default(cuid())
  title             String
  description       String
  price             Float
  discountPercentage Float   @default(0)
  rating            Float   @default(0)
  stock             Int     @default(0)
  brand             String
  category          String
  thumbnail         String?
  images            String[] @default([])
  tags              String[] @default([])
  reviews           Review[]
  cartItems         CartItem[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### Review Model

```prisma
model Review {
  id        String   @id @default(cuid())
  productId String
  rating    Int
  comment   String?
  author    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}
```

### CartItem Model

```prisma
model CartItem {
  id        String   @id @default(cuid())
  productId String
  quantity  Int      @default(1)
  addedAt   DateTime @default(now())
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}
```

## API Endpoints

### GET /api/products

Fetch products with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `search` (string): Search query
- `category` (string): Filter by category
- `brand` (string): Filter by brand
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter

**Response:**
```json
{
  "products": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "price": 99.99,
      "discountPercentage": 10,
      "rating": 4.5,
      "stock": 50,
      "brand": "string",
      "category": "string",
      "thumbnail": "string",
      "images": ["string"],
      "tags": ["string"],
      "reviews": [...],
      "createdAt": "2025-01-18T12:00:00Z",
      "updatedAt": "2025-01-18T12:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 12,
  "totalPages": 9
}
```

### GET /api/products/[id]

Fetch a single product by ID.

**Response:**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "price": 99.99,
  "discountPercentage": 10,
  "rating": 4.5,
  "stock": 50,
  "brand": "string",
  "category": "string",
  "thumbnail": "string",
  "images": ["string"],
  "tags": ["string"],
  "reviews": [...],
  "createdAt": "2025-01-18T12:00:00Z",
  "updatedAt": "2025-01-18T12:00:00Z"
}
```

### POST /api/products

Create a new product.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "price": 99.99,
  "discountPercentage": 10,
  "stock": 50,
  "brand": "string",
  "category": "string",
  "thumbnail": "string",
  "images": ["string"],
  "tags": ["string"]
}
```

### PUT /api/products/[id]

Update an existing product.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "price": 99.99,
  "discountPercentage": 10,
  "stock": 50,
  "brand": "string",
  "category": "string",
  "thumbnail": "string",
  "images": ["string"],
  "tags": ["string"]
}
```

### DELETE /api/products/[id]

Delete a product.

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

## Frontend Integration

### ProductAPI Utility

A utility class for easy API interaction:

```typescript
import { ProductAPI } from '@/lib/api/products';

// Get products with filters
const products = await ProductAPI.getProducts({
  page: 1,
  limit: 12,
  search: 'iPhone',
  category: 'Electronics',
  brand: 'Apple',
  minPrice: 100,
  maxPrice: 1000
});

// Get single product
const product = await ProductAPI.getProduct('product-id');

// Create product
const newProduct = await ProductAPI.createProduct({
  title: 'New Product',
  description: 'Product description',
  price: 99.99,
  brand: 'Brand',
  category: 'Category'
});

// Update product
const updatedProduct = await ProductAPI.updateProduct('product-id', {
  price: 89.99
});

// Delete product
await ProductAPI.deleteProduct('product-id');
```

### Updated Product Type

```typescript
export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand: string;
  thumbnail?: string;
  images: string[];
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Admin Interface

The admin page now includes a products management section that displays:

- **Product List**: Table view of all products
- **Product Details**: Title, brand, category, price, stock, rating
- **Stock Status**: Color-coded stock indicators
- **Rating Display**: Star rating with review count
- **Thumbnail Images**: Product thumbnails or placeholder icons

### Admin Features

- **Real-time Data**: Products loaded from database
- **Error Handling**: Toast notifications for errors
- **Loading States**: Loading spinners during data fetch
- **Responsive Design**: Mobile-friendly table layout

## Usage Examples

### Products Page

The products page now fetches data from the database:

```typescript
useEffect(() => {
  const fetchProducts = async () => {
    try {
      const data = await ProductAPI.getProducts({
        page: currentPage,
        limit: productsPerPage,
      });
      
      setProducts(data.products);
      setTotalProducts(data.total);
      setTotalPages(data.totalPages);
      
      success('Products loaded successfully', `${data.products.length} products available`);
    } catch (error) {
      handleNetworkError(error, 'Fetching Products');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthorized) {
    fetchProducts();
  }
}, [isAuthorized, currentPage, productsPerPage]);
```

### Error Handling

All API calls include comprehensive error handling:

```typescript
try {
  const data = await ProductAPI.getProducts();
  // Handle success
} catch (error) {
  handleError(error, 'Operation Name');
}
```

### Database Seeding

Sample products are seeded using the script:

```bash
npx tsx scripts/seed-products.ts
```

This creates 12 sample products across different categories:
- Electronics (iPhone, Samsung Galaxy, MacBook, Dell XPS)
- Audio (Sony Headphones, AirPods)
- Fashion (Nike Shoes, Adidas Shoes, Levi's Jeans, Uniqlo T-shirt)
- Home & Kitchen (KitchenAid Mixer, Dyson Vacuum)

## Migration

### Database Migration

The schema was updated with a new migration:

```bash
npx prisma migrate dev --name add_products_and_reviews
```

### Code Changes

1. **Updated Product Type**: Changed from external API format to database format
2. **API Integration**: Replaced dummy API calls with database API calls
3. **Pagination**: Moved from client-side to server-side pagination
4. **Error Handling**: Added comprehensive error handling with toast notifications
5. **Admin Interface**: Added products management table

## Performance Benefits

- **Server-side Pagination**: Only loads required products per page
- **Database Indexing**: Efficient queries with proper indexing
- **Caching**: Prisma client caching for better performance
- **Error Recovery**: Graceful error handling with user feedback

## Security

- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Prisma ORM prevents SQL injection
- **Error Sanitization**: Sensitive error details are not exposed to client
- **Authentication**: Admin endpoints require proper authentication

## Future Enhancements

- **Product Search**: Full-text search implementation
- **Image Upload**: File upload for product images
- **Bulk Operations**: Bulk import/export of products
- **Analytics**: Product performance metrics
- **Inventory Management**: Stock tracking and alerts
- **Product Variants**: Size, color, and other variants

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team
