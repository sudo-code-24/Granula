import { prisma } from '@/lib/database';
import { Prisma } from '@prisma/client';

export interface FindManyOptions {
  where?: any;
  include?: any;
  orderBy?: any;
  skip?: number;
  take?: number;
}

export interface FindUniqueOptions {
  where: any;
  include?: any;
}

export interface CreateOptions {
  data: any;
  include?: any;
}

export interface UpdateOptions {
  where: any;
  data: any;
  include?: any;
}

export interface DeleteOptions {
  where: any;
}

export interface CountOptions {
  where?: any;
}

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected model: any;

  constructor(model: any) {
    this.model = model;
  }

  /**
   * Find many records with optional filtering, pagination, and includes
   */
  async findMany(options: FindManyOptions = {}) {
    const { where, include, orderBy, skip, take } = options;
    
    return this.model.findMany({
      where,
      include,
      orderBy,
      skip,
      take,
    });
  }

  /**
   * Find a unique record by where clause
   */
  async findUnique(options: FindUniqueOptions) {
    const { where, include } = options;
    
    return this.model.findUnique({
      where,
      include,
    });
  }

  /**
   * Find the first record matching the where clause
   */
  async findFirst(options: FindManyOptions) {
    const { where, include, orderBy } = options;
    
    return this.model.findFirst({
      where,
      include,
      orderBy,
    });
  }

  /**
   * Create a new record
   */
  async create(options: CreateOptions) {
    const { data, include } = options;
    
    return this.model.create({
      data,
      include,
    });
  }

  /**
   * Update records matching the where clause
   */
  async update(options: UpdateOptions) {
    const { where, data, include } = options;
    
    return this.model.update({
      where,
      data,
      include,
    });
  }

  /**
   * Update many records matching the where clause
   */
  async updateMany(options: { where: any; data: any }) {
    const { where, data } = options;
    
    return this.model.updateMany({
      where,
      data,
    });
  }

  /**
   * Delete a record by where clause
   */
  async delete(options: DeleteOptions) {
    const { where } = options;
    
    return this.model.delete({
      where,
    });
  }

  /**
   * Delete many records matching the where clause
   */
  async deleteMany(options: DeleteOptions) {
    const { where } = options;
    
    return this.model.deleteMany({
      where,
    });
  }

  /**
   * Count records matching the where clause
   */
  async count(options: CountOptions = {}) {
    const { where } = options;
    
    return this.model.count({
      where,
    });
  }

  /**
   * Find records with pagination and total count
   */
  async findManyWithCount(options: FindManyOptions = {}) {
    const { where, include, orderBy, skip, take } = options;
    
    const [records, total] = await Promise.all([
      this.findMany({ where, include, orderBy, skip, take }),
      this.count({ where }),
    ]);

    return { records, total };
  }

  /**
   * Check if a record exists
   */
  async exists(where: any): Promise<boolean> {
    const count = await this.count({ where });
    return count > 0;
  }
}
