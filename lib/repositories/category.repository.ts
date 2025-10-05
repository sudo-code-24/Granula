import { prisma } from '@/lib/database';
import { Category, Prisma } from '@/app/generated/prisma';
import { BaseRepository } from './base.repository';

export interface CategoryWithCount extends Category {
  _count: {
    products: number;
  };
}

export interface CategoryWithProducts extends Category {
  products: {
    id: number;
    title: string;
    price: number;
    thumbnail?: string;
    slug: string;
    isActive: boolean;
  }[];
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  slug: string;
  image?: string;
  isActive?: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  slug?: string;
  image?: string;
  isActive?: boolean;
}

export class CategoryRepository extends BaseRepository<
  Category,
  Prisma.CategoryCreateInput,
  Prisma.CategoryUpdateInput
> {
  constructor() {
    super(prisma.category);
  }

  /**
   * Find category by slug
   */
  async findBySlug(slug: string): Promise<Category | null> {
    return this.findFirst({
      where: { slug },
    });
  }

  /**
   * Find category by slug with product count
   */
  async findBySlugWithCount(slug: string): Promise<CategoryWithCount | null> {
    const categories = await this.findMany({
      where: { slug },
      include: {
        _count: {
          select: { products: true },
        },
      },
      take: 1,
    });

    return categories[0] || null;
  }

  /**
   * Find category by slug with products
   */
  async findBySlugWithProducts(slug: string, options: {
    page?: number;
    limit?: number;
    orderBy?: any;
  } = {}): Promise<CategoryWithProducts | null> {
    const { page = 1, limit = 12, orderBy = { createdAt: 'desc' } } = options;
    const skip = (page - 1) * limit;

    const categories = await this.findMany({
      where: { slug },
      include: {
        products: {
          select: {
            id: true,
            title: true,
            price: true,
            thumbnail: true,
            slug: true,
            isActive: true,
          },
          orderBy,
          skip,
          take: limit,
        },
      },
      take: 1,
    });

    return categories[0] || null;
  }


  /**
   * Get categories
   */
  async findCategories(isActive: Boolean | null): Promise<Category[]> {
    const where: any = {};
    if (isActive != null) {
      where.isActive = isActive
    }

    return this.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get all active categories with product count
   */
  async findActiveWithCount(): Promise<CategoryWithCount[]> {
    return this.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get categories with pagination
   */
  async findWithPagination(options: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    orderBy?: any;
  } = {}): Promise<{ categories: CategoryWithCount[]; total: number; totalPages: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      orderBy = { name: 'asc' }
    } = options;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const { records: categories, total } = await this.findManyWithCount({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    return {
      categories,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Search categories
   */
  async search(query: string, options: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  } = {}): Promise<{ categories: CategoryWithCount[]; total: number; totalPages: number }> {
    return this.findWithPagination({
      ...options,
      search: query,
    });
  }

  /**
   * Get category statistics
   */
  async getStats() {
    const [total, active, inactive, withProducts, withoutProducts] = await Promise.all([
      this.count(),
      this.count({ where: { isActive: true } }),
      this.count({ where: { isActive: false } }),
      this.count({
        where: {
          products: {
            some: {},
          },
        },
      }),
      this.count({
        where: {
          products: {
            none: {},
          },
        },
      }),
    ]);

    return {
      total,
      active,
      inactive,
      withProducts,
      withoutProducts,
    };
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string, excludeId?: number): Promise<boolean> {
    const where: any = { slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    return this.exists(where);
  }

  /**
   * Check if name exists
   */
  async nameExists(name: string, excludeId?: number): Promise<boolean> {
    const where: any = { name };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    return this.exists(where);
  }

  /**
   * Get categories with most products
   */
  async findMostPopular(limit: number = 10): Promise<CategoryWithCount[]> {
    return this.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        products: {
          _count: 'desc',
        },
      },
      take: limit,
    });
  }

  /**
   * Get categories with no products
   */
  async findEmpty(): Promise<Category[]> {
    return this.findMany({
      where: {
        products: {
          none: {},
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Activate category
   */
  async activate(id: number): Promise<Category> {
    return this.update({
      where: { id },
      data: { isActive: true },
    });
  }

  /**
   * Deactivate category
   */
  async deactivate(id: number): Promise<Category> {
    return this.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Toggle category active status
   */
  async toggleActive(id: number): Promise<Category> {
    const category = await this.findUnique({ where: { id } });
    if (!category) {
      throw new Error('Category not found');
    }

    return this.update({
      where: { id },
      data: { isActive: !category.isActive },
    });
  }

  /**
   * Delete category and handle related products
   */
  async deleteCategory(id: number, options: {
    moveProductsToCategory?: number;
    deleteProducts?: boolean;
  } = {}): Promise<void> {
    const { moveProductsToCategory, deleteProducts = false } = options;

    // Check if category has products
    const category = await this.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    if (category._count.products > 0) {
      if (moveProductsToCategory) {
        // Move products to another category
        await prisma.product.updateMany({
          where: { categoryId: id },
          data: { categoryId: moveProductsToCategory },
        });
      } else if (deleteProducts) {
        // Delete all products in this category
        await prisma.product.deleteMany({
          where: { categoryId: id },
        });
      } else {
        throw new Error('Category has products. Specify moveProductsToCategory or deleteProducts option.');
      }
    }

    // Delete category
    await this.delete({ where: { id } });
  }

  /**
   * Get category breadcrumb path
   */
  async getBreadcrumb(slug: string): Promise<{ name: string; slug: string }[]> {
    const category = await this.findBySlug(slug);
    if (!category) {
      return [];
    }

    return [{
      name: category.name,
      slug: category.slug,
    }];
  }

  /**
  * Create Category
  */
  async createCategory(newCategory: Category): Promise<Category> {
    return this.create({ data: newCategory })

  }
}
