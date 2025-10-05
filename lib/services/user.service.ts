import { UserRepository } from '@/lib/repositories/user.repository';
import bcrypt from 'bcryptjs';

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

export interface UserServiceResponse {
  success: boolean;
  user?: any;
  message?: string;
  error?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserData): Promise<UserServiceResponse> {
    try {
      // Validate input
      const validation = this.validateCreateUserData(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
        };
      }

      // Check if email already exists
      const emailExists = await this.userRepository.emailExists(data.email);
      if (emailExists) {
        return {
          success: false,
          error: 'Email already exists',
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create user
      const user = await this.userRepository.createWithProfile({
        ...data,
        password: hashedPassword,
      });

      return {
        success: true,
        user,
        message: 'User created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user',
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<UserServiceResponse> {
    try {
      const user = await this.userRepository.findByIdWithRelations(id);
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user',
      };
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserServiceResponse> {
    try {
      const user = await this.userRepository.findByEmail(email);
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user',
      };
    }
  }

  /**
   * Update user
   */
  async updateUser(id: number, data: UpdateUserData): Promise<UserServiceResponse> {
    try {
      // Validate input
      const validation = this.validateUpdateUserData(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
        };
      }

      // Check if email already exists (if email is being updated)
      if (data.email) {
        const emailExists = await this.userRepository.emailExists(data.email);
        if (emailExists) {
          return {
            success: false,
            error: 'Email already exists',
          };
        }
      }

      // Hash password if provided
      const updateData = { ...data };
      if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 12);
      }

      const user = await this.userRepository.updateWithProfile(id, updateData);

      return {
        success: true,
        user,
        message: 'User updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user',
      };
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<UserServiceResponse> {
    try {
      await this.userRepository.delete({ where: { id } });

      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user',
      };
    }
  }

  /**
   * Authenticate user
   */
  async authenticateUser(loginData: LoginData): Promise<UserServiceResponse> {
    try {
      const { email, password } = loginData;

      // Get user by email
      const userResult = await this.getUserByEmail(email);
      if (!userResult.success || !userResult.user) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      const user = userResult.user;

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        message: 'Authentication successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  /**
   * Set login token
   */
  async setLoginToken(userId: number, token: string, expiresAt: Date): Promise<UserServiceResponse> {
    try {
      await this.userRepository.setLoginToken(userId, token, expiresAt);

      return {
        success: true,
        message: 'Login token set successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set login token',
      };
    }
  }

  /**
   * Clear login token
   */
  async clearLoginToken(userId: number): Promise<UserServiceResponse> {
    try {
      await this.userRepository.clearLoginToken(userId);

      return {
        success: true,
        message: 'Login token cleared successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear login token',
      };
    }
  }

  /**
   * Get user by login token
   */
  async getUserByToken(token: string): Promise<UserServiceResponse> {
    try {
      const user = await this.userRepository.findByLoginToken(token);
      
      if (!user) {
        return {
          success: false,
          error: 'Invalid or expired token',
        };
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user by token',
      };
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(roleId: number, options: {
    page?: number;
    limit?: number;
    orderBy?: any;
  } = {}) {
    try {
      const result = await this.userRepository.findByRole(roleId, options);
      return {
        success: true,
        users: result.users,
        total: result.total,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get users by role',
      };
    }
  }

  /**
   * Search users
   */
  async searchUsers(query: string, options: {
    page?: number;
    limit?: number;
    orderBy?: any;
  } = {}) {
    try {
      const result = await this.userRepository.search(query, options);
      return {
        success: true,
        users: result.users,
        total: result.total,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search users',
      };
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    try {
      const stats = await this.userRepository.getStats();
      return {
        success: true,
        stats,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user statistics',
      };
    }
  }

  /**
   * Cleanup expired tokens
   */
  async cleanupExpiredTokens(): Promise<UserServiceResponse> {
    try {
      const count = await this.userRepository.cleanupExpiredTokens();
      
      return {
        success: true,
        message: `${count} expired tokens cleaned up`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cleanup expired tokens',
      };
    }
  }

  /**
   * Validate create user data
   */
  private validateCreateUserData(data: CreateUserData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Valid email is required');
    }

    if (!data.password || data.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (!data.roleId || data.roleId <= 0) {
      errors.push('Valid role ID is required');
    }

    if (data.profile?.firstName && data.profile.firstName.trim().length === 0) {
      errors.push('First name cannot be empty');
    }

    if (data.profile?.lastName && data.profile.lastName.trim().length === 0) {
      errors.push('Last name cannot be empty');
    }

    if (data.profile?.phone && !this.isValidPhone(data.profile.phone)) {
      errors.push('Invalid phone number format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate update user data
   */
  private validateUpdateUserData(data: UpdateUserData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Valid email is required');
    }

    if (data.password && data.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (data.roleId && data.roleId <= 0) {
      errors.push('Valid role ID is required');
    }

    if (data.profile?.firstName && data.profile.firstName.trim().length === 0) {
      errors.push('First name cannot be empty');
    }

    if (data.profile?.lastName && data.profile.lastName.trim().length === 0) {
      errors.push('Last name cannot be empty');
    }

    if (data.profile?.phone && !this.isValidPhone(data.profile.phone)) {
      errors.push('Invalid phone number format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone format
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
}
