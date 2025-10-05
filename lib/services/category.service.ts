import { CategoryRepository } from "@/lib/repositories/category.repository";
import { Category } from '@/app/generated/prisma';
import { APIResponse } from "@/types/APIResponse";
import { Caesar_Dressing } from "next/font/google";

export class CategoryService {
    private categoryRepository: CategoryRepository;
    constructor() {
        this.categoryRepository = new CategoryRepository()
    }
    /**
   * Get Categories
   */
    async getCategories(isActive: Boolean | null): Promise<APIResponse<Category[]>> {
        try {
            const categories: Category[] = await this.categoryRepository.findCategories(isActive);
            return {
                success: true,
                data: categories,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get categories',
            };
        }
    }

    async createCategory(category: Category): Promise<APIResponse<Category>> {
        try {
            if (!category) {
                return {
                    success: false,
                    error: '',
                };
            }
            const result = await this.categoryRepository.createCategory(category)
            return {
                success: true,
                data: result,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to add category',
            };
        }
    }

}