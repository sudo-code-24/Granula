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

export class BrandAPI {
  private static baseUrl = '/api/brands';

  /**
   * Fetch all brands
   */
  static async getBrands(isActive: boolean = true): Promise<Brand[]> {
    const params = new URLSearchParams();
    params.append('isActive', isActive.toString());

    const url = `${this.baseUrl}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch brands: ${response.status}`);
    }

    return response.json();
  }
}
