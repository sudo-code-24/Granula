export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  slug: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
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
  categoryId: number;
  brandId: number;
  category: Category;
  brand: Brand;
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}
// API response types
export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductResponse {
  product: Product;
  success: boolean;
  message?: string;
}
