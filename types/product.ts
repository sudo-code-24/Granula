import { Brand, Category } from "@/app/generated/prisma";

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export interface Review extends AuditableFields {
  rating: number;
  comment?: string;
  author?: string;
}

export interface AuditableFields {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommonFields {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Product extends AuditableFields {
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
export type SortOption =
  | "price_asc"
  | "price_desc"
  | "rating_asc"
  | "newest"
  | "oldest"
  | "popular"
  | "";

export interface ProductFilter {
  categoryIds?: number[];
  brandIds?: number[];
  priceRange?: PriceRange;
  minRating?: number;
  sort?: SortOption;
  tags?: string[];
  isActive?: boolean;
  search?: string
}

export interface PriceRange {
  min: number;
  max: number
}
