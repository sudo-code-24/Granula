import { Brand } from "@/app/generated/prisma";
import { APIResponse } from "@/types/APIResponse";

export class BrandAPI {
  private static baseUrl = '/api/brands';
  /**
   * Fetch all brands
   */
  static async getBrands(isActive: boolean = true): Promise<APIResponse<Brand[]>> {
    try {
      const params = new URLSearchParams();
      params.append('isActive', isActive.toString());

      const url = `${this.baseUrl}?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch brands: ${response.status}`);
      }
      const result: APIResponse<Brand[]> = await response.json();
      return result;
    } catch (err) {
      throw err;
    }
  }
}
