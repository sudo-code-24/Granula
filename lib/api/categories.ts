export interface Category {
  id: number;
  name: string;
  description?: string;
  slug: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class CategoryAPI {
  private static baseUrl = '/api/categories';

  /**
   * Fetch all categories
   */
  static async getCategories(isActive: boolean = true): Promise<Category[]> {
    const params = new URLSearchParams();
    params.append('isActive', isActive.toString());

    const url = `${this.baseUrl}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    return response.json();
  }
}
