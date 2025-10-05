import { prisma } from '@/lib/database';
import { User, Prisma } from '@/app/generated/prisma';
import { BaseRepository } from './base.repository';

export interface UserWithRelations extends User {
  role: {
    id: number;
    name: string;
    description?: string;
    level: number;
    createdAt: Date;
    updatedAt: Date;
  };
  profile?: {
    id: number;
    userId: number;
    firstName?: string;
    lastName?: string;
    position?: string;
    department?: string;
    phone?: string;
    address?: string;
    hireDate?: Date;
  };
  cart?: {
    id: number;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface CreateUserData {
  email: string;
  password: string;
  roleId: number;
  profile?: {
    firstName?: string;
    lastName?: string;
    position?: string;
    department?: string;
    phone?: string;
    address?: string;
    hireDate?: Date;
  };
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  roleId?: number;
  loginToken?: string;
  tokenExpires?: Date;
  profile?: {
    firstName?: string;
    lastName?: string;
    position?: string;
    department?: string;
    phone?: string;
    address?: string;
    hireDate?: Date;
  };
}

export class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  constructor() {
    super(prisma.user);
  }

  /**
   * Find user by email with relations
   */
  async findByEmail(email: string): Promise<UserWithRelations | null> {
    const users = await this.findMany({
      where: { email },
      include: {
        role: true,
        profile: true,
        cart: true,
      },
      take: 1,
    });

    return users[0] || null;
  }

  /**
   * Find user by ID with relations
   */
  async findByIdWithRelations(id: number): Promise<UserWithRelations | null> {
    const users = await this.findMany({
      where: { id },
      include: {
        role: true,
        profile: true,
        cart: true,
      },
      take: 1,
    });

    return users[0] || null;
  }

  /**
   * Find user by login token
   */
  async findByLoginToken(token: string): Promise<UserWithRelations | null> {
    const users = await this.findMany({
      where: { 
        loginToken: token,
        tokenExpires: {
          gt: new Date(), // Token not expired
        },
      },
      include: {
        role: true,
        profile: true,
        cart: true,
      },
      take: 1,
    });

    return users[0] || null;
  }

  /**
   * Create user with profile
   */
  async createWithProfile(data: CreateUserData): Promise<UserWithRelations> {
    const { profile, ...userData } = data;

    const user = await this.create({
      data: {
        ...userData,
        profile: profile ? {
          create: profile,
        } : undefined,
      },
      include: {
        role: true,
        profile: true,
        cart: true,
      },
    });

    return user;
  }

  /**
   * Update user with profile
   */
  async updateWithProfile(id: number, data: UpdateUserData): Promise<UserWithRelations> {
    const { profile, ...userData } = data;

    const user = await this.update({
      where: { id },
      data: {
        ...userData,
        profile: profile ? {
          upsert: {
            create: profile,
            update: profile,
          },
        } : undefined,
      },
      include: {
        role: true,
        profile: true,
        cart: true,
      },
    });

    return user;
  }

  /**
   * Set login token for user
   */
  async setLoginToken(id: number, token: string, expiresAt: Date): Promise<void> {
    await this.update({
      where: { id },
      data: {
        loginToken: token,
        tokenExpires: expiresAt,
      },
    });
  }

  /**
   * Clear login token for user
   */
  async clearLoginToken(id: number): Promise<void> {
    await this.update({
      where: { id },
      data: {
        loginToken: null,
        tokenExpires: null,
      },
    });
  }

  /**
   * Find users by role
   */
  async findByRole(roleId: number, options: {
    page?: number;
    limit?: number;
    orderBy?: any;
  } = {}): Promise<{ users: UserWithRelations[]; total: number }> {
    const { page = 1, limit = 10, orderBy = { createdAt: 'desc' } } = options;
    const skip = (page - 1) * limit;

    const { records: users, total } = await this.findManyWithCount({
      where: { roleId },
      include: {
        role: true,
        profile: true,
        cart: true,
      },
      orderBy,
      skip,
      take: limit,
    });

    return { users, total };
  }

  /**
   * Find users by department
   */
  async findByDepartment(department: string, options: {
    page?: number;
    limit?: number;
    orderBy?: any;
  } = {}): Promise<{ users: UserWithRelations[]; total: number }> {
    const { page = 1, limit = 10, orderBy = { createdAt: 'desc' } } = options;
    const skip = (page - 1) * limit;

    const { records: users, total } = await this.findManyWithCount({
      where: {
        profile: {
          department: {
            contains: department,
            mode: 'insensitive',
          },
        },
      },
      include: {
        role: true,
        profile: true,
        cart: true,
      },
      orderBy,
      skip,
      take: limit,
    });

    return { users, total };
  }

  /**
   * Search users by name or email
   */
  async search(query: string, options: {
    page?: number;
    limit?: number;
    orderBy?: any;
  } = {}): Promise<{ users: UserWithRelations[]; total: number }> {
    const { page = 1, limit = 10, orderBy = { createdAt: 'desc' } } = options;
    const skip = (page - 1) * limit;

    const { records: users, total } = await this.findManyWithCount({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { profile: { firstName: { contains: query, mode: 'insensitive' } } },
          { profile: { lastName: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        role: true,
        profile: true,
        cart: true,
      },
      orderBy,
      skip,
      take: limit,
    });

    return { users, total };
  }

  /**
   * Get user statistics
   */
  async getStats() {
    const [total, byRole, byDepartment] = await Promise.all([
      this.count(),
      prisma.role.findMany({
        include: {
          _count: {
            select: { users: true },
          },
        },
      }),
      prisma.user.groupBy({
        by: ['roleId'],
        _count: {
          id: true,
        },
      }),
    ]);

    return {
      total,
      byRole,
      byDepartment,
    };
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    return this.exists({ email });
  }

  /**
   * Get users with expired tokens
   */
  async findWithExpiredTokens(): Promise<User[]> {
    return this.findMany({
      where: {
        tokenExpires: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.updateMany({
      where: {
        tokenExpires: {
          lt: new Date(),
        },
      },
      data: {
        loginToken: null,
        tokenExpires: null,
      },
    });

    return result.count;
  }
}
