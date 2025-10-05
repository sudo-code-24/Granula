import { BrandRepository } from "@/lib/repositories/brand.repository";
import { Brand } from '@/app/generated/prisma';

export class BrandService {
    private brandRepository: BrandRepository;
    constructor() {
        this.brandRepository = new BrandRepository()
    }
    /**
   * Get brands
   */
    async getBrands(isActive: Boolean | null) {
        try {
            let brands: Brand[] = await this.brandRepository.findBrands(isActive);
            return {
                success: true,
                data: brands,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get Active brands',
            };
        }
    }

}