import { Category } from "@/app/generated/prisma";
import { APIResponse } from "@/types/APIResponse";

export class CategoryAPI {
  private static baseUrl = '/api/categories';

  /**
   * Fetch all categories
   */
  static async getCategories(isActive: boolean = true): Promise<APIResponse<Category[]>> {
    try {
      const params = new URLSearchParams();
      params.append('isActive', isActive.toString());

      const url = `${this.baseUrl}?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }
      const result: APIResponse<Category[]> = await response.json();
      return result;
    } catch (error) {
      throw error
    }
  }
}
