import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select";
import { ProductFilter, PriceRange, SortOption } from '@/types/product';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

import { defaultFilters, getLabelbyId, getLabelByValue, getPriceRangeLabel, getPriceRangeValues, priceFilterOptions, priceRanges, sortFilterOptions } from '@/lib/helpers';
import { Category, Brand } from '@/app/generated/prisma';

interface ProductFilterPopupProps {
  isOpen: boolean;
  categories?: Category[];
  brands?: Brand[];
  onClose: () => void;
  onApplyFilters?: (filters: ProductFilter) => void;
  initialFilters?: ProductFilter;
}

export default function ProductFilterPopup({ isOpen, categories = [], brands = [], onClose, onApplyFilters, initialFilters }: ProductFilterPopupProps) {
  const [filters, setFilters] = useState<ProductFilter>({
    ...defaultFilters
  });

  const [priceRange, setPriceRange] = useState<string>("")

  // Sync internal filters with initialFilters prop
  useEffect(() => {
    if (initialFilters) {
      setFilters({ ...initialFilters });
    }
    initializePriceRange();
  }, [initialFilters, isOpen]);

  const initializePriceRange = () => {
    const range = filters.priceRange;
    const search = priceRanges.find(r => r.value.min == range?.min && r.value.max == range.max);
    if (search) {
      handlePriceRangeChange(search.key)
    }
  }

  const handlePriceRangeChange = (value: string) => {
    setPriceRange(value)
    const range = getPriceRangeValues(value)
    handleFilterChange('priceRange', range)
  }

  const handleFilterChange = <T extends keyof ProductFilter>(
    key: T,
    value: ProductFilter[T] | ProductFilter[T][]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    onApplyFilters?.(filters);
    beforeClose();
  };

  const handleClearFilters = () => {
    setFilters({
      ...defaultFilters
    });
    setPriceRange("")
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      beforeClose();
    }
  };

  const beforeClose = () => {
    setFilters({ ...initialFilters })
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className=" bg-neutral-900 border-gray-600  rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Filter Products</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-neutral-900 "
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categories
              </label>
              <MultiSelect
                options={categories.map(category => ({
                  value: category.id,
                  label: category.name
                }))}
                selected={filters.categoryIds ?? []}
                onChange={(selected: number[]) => handleFilterChange('categoryIds', selected)}
                placeholder="Select categories..."
                className="bg-neutral-900 border-gray-600 text-white"
                name={(filters.categoryIds ?? []).length > 1 ? 'categories' : 'category'}
              />
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Brands
              </label>
              <MultiSelect
                options={brands.map(brand => ({
                  value: brand.id,
                  label: brand.name
                }))}
                selected={filters.brandIds ?? []}
                onChange={(selected) => handleFilterChange('brandIds', selected)}
                placeholder="Select brands..."
                className="bg-neutral-900 border-gray-600 text-white"
                name={(filters.brandIds ?? []).length > 1 ? 'brands' : 'brand'}
              />
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price Range
              </label>
              <Select value={priceRange} onValueChange={(value) => handlePriceRangeChange(value)}>
                <SelectTrigger className="w-full px-4 py-3 text-sm bg-neutral-900  border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white">
                  <SelectValue placeholder="Select Price Range" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900  border border-gray-600">
                  {priceFilterOptions.map(({ value, label }, i) =>
                    <SelectItem key={i} value={value} className="text-white hover:bg-gray-700">{label}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort By
              </label>
              <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value as SortOption)}>
                <SelectTrigger className="w-full px-4 py-3 text-sm bg-neutral-900  border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900  border border-gray-600">
                  {sortFilterOptions.map(({ value, label }) => <SelectItem key={value} value={value} className="text-white hover:bg-gray-700">{label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {((filters.categoryIds?.length ?? 0) > 0 || (filters.brandIds?.length ?? 0) > 0
            || filters.priceRange || filters.sort) && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Active Filters
                </label>
                <div className="flex flex-wrap gap-2">
                  {filters.categoryIds?.map(categoryId => (
                    <div key={categoryId} className="px-3 py-1 bg-orange-500 text-white text-sm rounded-full flex items-center gap-2">
                      <span>{getLabelbyId(categories, categoryId)}</span>
                      <button
                        onClick={() => handleFilterChange('categoryIds', filters.categoryIds?.filter(c => c !== categoryId))}
                        className="hover:bg-orange-600 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {filters.brandIds?.map(brandId => (
                    <div key={brandId} className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full flex items-center gap-2">
                      <span>{getLabelbyId(brands, brandId)}</span>
                      <button
                        onClick={() => handleFilterChange('brandIds', filters.brandIds?.filter(b => b !== brandId))}
                        className="hover:bg-blue-600 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {(filters.priceRange && priceRange) && (
                    <div className="px-3 py-1 bg-green-500 text-white text-sm rounded-full flex items-center gap-2">
                      <span>{getPriceRangeLabel(filters.priceRange).replace('-', ' - ').replace('under', 'Under $').replace('over', 'Over $')}</span>
                      <button
                        onClick={() => { handleFilterChange('priceRange', defaultFilters.priceRange); setPriceRange("") }}
                        className="hover:bg-green-600 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {filters.sort && (
                    <div className="px-3 py-1 bg-gray-800 text-white text-sm rounded-full flex items-center gap-2">
                      <span>{getLabelByValue(sortFilterOptions, filters.sort)?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <button
                        onClick={() => handleFilterChange('sort', defaultFilters.sort)}
                        className="hover:bg-purple-600 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-700">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="text-gray-300 border-gray-600 hover:bg-neutral-900 "
            >
              Clear All
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="bg-primary hover:scale-105 hover:cursor-pointer"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
