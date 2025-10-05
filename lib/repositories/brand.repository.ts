import { prisma } from '@/lib/database';
import { Brand, Prisma } from '@/app/generated/prisma';
import { BaseRepository } from './base.repository';

export interface BrandWithCount extends Brand {
  _count: {
    products: number;
  };
}

export interface BrandWithProducts extends Brand {
  products: {
    id: number;
    title: string;
    price: number;
    thumbnail?: string;
    slug: string;
    isActive: boolean;
  }[];
}

export interface CreateBrandData {
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive?: boolean;
}

export interface UpdateBrandData {
  name?: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive?: boolean;
}

export class BrandRepository extends BaseRepository<
  Brand,
  Prisma.BrandCreateInput,
  Prisma.BrandUpdateInput
> {
  constructor() {
    super(prisma.brand);
  }

  /**
   * Find brand by name
   */
  async findByName(name: string): Promise<Brand | null> {
    return this.findFirst({
      where: { name },
    });
  }

  /**
   * Find brand by name with product count
   */
  async findByNameWithCount(name: string): Promise<BrandWithCount | null> {
    const brands = await this.findMany({
      where: { name },
      include: {
        _count: {
          select: { products: true },
        },
      },
      take: 1,
    });

    return brands[0] || null;
  }

  /**
   * Find brand by name with products
   */
  async findByNameWithProducts(name: string, options: {
    page?: number;
    limit?: number;
    orderBy?: any;
  } = {}): Promise<BrandWithProducts | null> {
    const { page = 1, limit = 12, orderBy = { createdAt: 'desc' } } = options;
    const skip = (page - 1) * limit;

    const brands = await this.findMany({
      where: { name },
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

    return brands[0] || null;
  }


  /**
   * Get brands
   */
  async findBrands(isActive: Boolean | null): Promise<Brand[]> {
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
   * Get all active brands with product count
   */
  async findActiveWithCount(): Promise<BrandWithCount[]> {
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
   * Get brands with pagination
   */
  async findWithPagination(options: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    orderBy?: any;
  } = {}): Promise<{ brands: BrandWithCount[]; total: number; totalPages: number }> {
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
        { website: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const { records: brands, total } = await this.findManyWithCount({
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
      brands,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Search brands
   */
  async search(query: string, options: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  } = {}): Promise<{ brands: BrandWithCount[]; total: number; totalPages: number }> {
    return this.findWithPagination({
      ...options,
      search: query,
    });
  }

  /**
   * Get brand statistics
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
   * Get brands with most products
   */
  async findMostPopular(limit: number = 10): Promise<BrandWithCount[]> {
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
   * Get brands with no products
   */
  async findEmpty(): Promise<Brand[]> {
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
   * Activate brand
   */
  async activate(id: number): Promise<Brand> {
    return this.update({
      where: { id },
      data: { isActive: true },
    });
  }

  /**
   * Deactivate brand
   */
  async deactivate(id: number): Promise<Brand> {
    return this.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Toggle brand active status
   */
  async toggleActive(id: number): Promise<Brand> {
    const brand = await this.findUnique({ where: { id } });
    if (!brand) {
      throw new Error('Brand not found');
    }

    return this.update({
      where: { id },
      data: { isActive: !brand.isActive },
    });
  }

  /**
   * Delete brand and handle related products
   */
  async deleteBrand(id: number, options: {
    moveProductsToBrand?: number;
    deleteProducts?: boolean;
  } = {}): Promise<void> {
    const { moveProductsToBrand, deleteProducts = false } = options;

    // Check if brand has products
    const brand = await this.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw new Error('Brand not found');
    }

    if (brand._count.products > 0) {
      if (moveProductsToBrand) {
        // Move products to another brand
        await prisma.product.updateMany({
          where: { brandId: id },
          data: { brandId: moveProductsToBrand },
        });
      } else if (deleteProducts) {
        // Delete all products for this brand
        await prisma.product.deleteMany({
          where: { brandId: id },
        });
      } else {
        throw new Error('Brand has products. Specify moveProductsToBrand or deleteProducts option.');
      }
    }

    // Delete brand
    await this.delete({ where: { id } });
  }

  /**
   * Get brands with website
   */
  async findWithWebsite(): Promise<Brand[]> {
    return this.findMany({
      where: {
        website: {
          not: null,
        },
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get brands without logo
   */
  async findWithoutLogo(): Promise<Brand[]> {
    return this.findMany({
      where: {
        logo: null,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Update brand logo
   */
  async updateLogo(id: number, logoUrl: string): Promise<Brand> {
    return this.update({
      where: { id },
      data: { logo: logoUrl },
    });
  }

  /**
   * Update brand website
   */
  async updateWebsite(id: number, website: string): Promise<Brand> {
    return this.update({
      where: { id },
      data: { website },
    });
  }

  /**
   * Get brand by ID with product count
   */
  async findByIdWithCount(id: number): Promise<BrandWithCount | null> {
    const brands = await this.findMany({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
      take: 1,
    });

    return brands[0] || null;
  }

  /**
   * Get brand by ID with products
   */
  async findByIdWithProducts(id: number, options: {
    page?: number;
    limit?: number;
    orderBy?: any;
  } = {}): Promise<BrandWithProducts | null> {
    const { page = 1, limit = 12, orderBy = { createdAt: 'desc' } } = options;
    const skip = (page - 1) * limit;

    const brands = await this.findMany({
      where: { id },
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

    return brands[0] || null;
  }
}
