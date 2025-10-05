import React, { useEffect, useState } from 'react';
import { BrandAPI } from '@/lib/api/brands';
import { CategoryAPI } from '@/lib/api/categories';
import { ProductFilter, PriceRange } from '@/types/product';
import ProductFilterPopup from './ProductFilterPopup';
import FilterTrigger from './FilterTrigger';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { defaultFilters, getPriceRangeLabel, getLabelbyId, getLabelByValue, sortFilterOptions } from '@/lib/helpers';
import { Category, Brand } from '@/app/generated/prisma';
import { APIResponse } from '@/types/APIResponse';

interface ProductFilterProps {
  onApplyFilters?: (filters: ProductFilter) => void;
}

export default function ProductFilterComponent({ onApplyFilters }: ProductFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<ProductFilter>({ ...defaultFilters });
  const { handleNetworkError, success } = useErrorHandler();

  // Fetch categories and brands on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesData, brandsData]: [APIResponse<Category[]>, APIResponse<Brand[]>] = await Promise.all([
          CategoryAPI.getCategories(true),
          BrandAPI.getBrands(true)
        ]);

        if (categoriesData.success && categoriesData.data) {
          setCategories(categoriesData.data);
        }
        if (brandsData.success && brandsData.data) {
          setBrands(brandsData.data);
        }
        success('Filter data loaded', 'Categories and brands loaded successfully');

      } catch (error) {
        handleNetworkError(error, 'Fetching Products');
        console.error('Error fetching filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApplyFilters = (filters: ProductFilter) => {
    console.log("updated", { filters });
    setAppliedFilters(filters);
    console.log({ appliedFilters });

    // Here you would typically trigger a search/filter action
    onApplyFilters?.(filters);
  };

  const getActiveFiltersCount = () => {
    return (appliedFilters?.categoryIds?.length ?? 0) +
      (appliedFilters?.brandIds?.length ?? 0) +
      (appliedFilters.priceRange ? 1 : 0) +
      (appliedFilters.sort ? 1 : 0);
  };

  return (
    <div>
      {/* Search and Filter Section */}
      <div className="mb-6">
        {/* Top Section - Search Bar and Filter Button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={appliedFilters.search}
                onChange={(e) => setAppliedFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-4 py-3 pl-12 pr-4 text-sm bg-gray-500/20 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Filter Button */}
          <FilterTrigger
            isOpen={isPopupOpen}
            onToggle={() => setIsPopupOpen(!isPopupOpen)}
            activeFiltersCount={getActiveFiltersCount()}
          />
        </div>

        {/* Bottom Section - Active Filter Tags */}
        {getActiveFiltersCount() > 0 && (
          <div className="flex flex-wrap gap-2">
            {/* Active Filter Tags - Dynamically generated based on applied filters */}
            {appliedFilters.categoryIds && appliedFilters.categoryIds.map(categoryId => (
              <div key={categoryId} className="px-3 py-1 bg-orange-500 text-white text-sm rounded-full flex items-center gap-2">
                <span>{getLabelbyId(categories, categoryId)}</span>
                <button
                  onClick={() => setAppliedFilters(prev => ({
                    ...prev,
                    categories: prev?.categoryIds?.filter(c => c !== categoryId)
                  }))}
                  className="hover:bg-orange-600 rounded-full p-0.5"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {appliedFilters.brandIds && appliedFilters.brandIds.map(brandId => (
              <div key={brandId} className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full flex items-center gap-2">
                <span>{getLabelbyId(brands, brandId)}</span>
                <button
                  onClick={() => setAppliedFilters(prev => ({
                    ...prev,
                    brands: prev?.brandIds?.filter(b => b !== brandId)
                  }))}
                  className="hover:bg-blue-600 rounded-full p-0.5"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {(appliedFilters.priceRange && appliedFilters.priceRange != defaultFilters?.priceRange) && (
              <div className="px-3 py-1 bg-green-500 text-white text-sm rounded-full flex items-center gap-2">
                <span>{getPriceRangeLabel(appliedFilters.priceRange).replace('-', ' - ').replace('under', 'Under $').replace('over', 'Over $')}</span>
                <button
                  onClick={() => setAppliedFilters(prev => ({ ...prev, priceRange: defaultFilters.priceRange }))}
                  className="hover:bg-green-600 rounded-full p-0.5"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {appliedFilters.sort && (
              <div className="px-3 py-1 bg-purple-500 text-white text-sm rounded-full flex items-center gap-2">
                <span>{getLabelByValue(sortFilterOptions, appliedFilters.sort)?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                <button
                  onClick={() => setAppliedFilters(prev => ({ ...prev, sort: defaultFilters.sort }))}
                  className="hover:bg-purple-600 rounded-full p-0.5"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {/* Clear All Filters Button */}
            <button
              onClick={() => handleApplyFilters({ ...defaultFilters })}
              className="px-3 py-1 bg-red-500/20 text-red-300 text-sm rounded-full hover:bg-red-500/30 transition-colors flex items-center gap-1"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Filter Popup */}
      {
        loading ? (
          <div>Loading filters...</div>
        ) : <ProductFilterPopup
          isOpen={isPopupOpen}
          categories={categories}
          brands={brands}
          onClose={() => setIsPopupOpen(false)}
          onApplyFilters={handleApplyFilters}
          initialFilters={appliedFilters}
        />
      }

    </div >
  );
}