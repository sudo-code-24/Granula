import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select";
import { Category, Brand } from '@/types/product';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ProductFilterPopupProps {
  isOpen: boolean;
  categories?: Category[];
  brands?: Brand[];
  onClose: () => void;
  onApplyFilters?: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

interface FilterState {
  categories: string[];
  brands: string[];
  priceRange: string;
  sort: string;
}

export default function ProductFilterPopup({ isOpen, categories = [], brands = [], onClose, onApplyFilters, initialFilters }: ProductFilterPopupProps) {
  const [selectedCategories, setCategories] = useState<Category[]>([]);
  const [selectedBrands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    priceRange: '',
    sort: '',
  });

  const priceFilterOptions = [
    { value: '_', label: 'All Prices' },
    { value: 'under-25', label: 'Under $25' },
    { value: '25-50', label: '$25 - $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100-250', label: '$100 - $250' },
    { value: '250-500', label: '$250 - $500' },
    { value: 'over-500', label: 'Over $500' },
  ]
  const sortFilterOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
  ]
  // Sync internal filters with initialFilters prop
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);


  const handleFilterChange = (key: keyof FilterState, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    onApplyFilters?.(filters);
    onClose();
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      brands: [],
      priceRange: '',
      sort: '',
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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
                  value: category.name,
                  label: category.name
                }))}
                selected={filters.categories}
                onChange={(selected) => handleFilterChange('categories', selected)}
                placeholder="Select categories..."
                className="bg-neutral-900 border-gray-600 text-white"
              />
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Brands
              </label>
              <MultiSelect
                options={brands.map(brand => ({
                  value: brand.name,
                  label: brand.name
                }))}
                selected={filters.brands}
                onChange={(selected) => handleFilterChange('brands', selected)}
                placeholder="Select brands..."
                className="bg-neutral-900 border-gray-600 text-white"
              />
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price Range
              </label>
              <Select value={filters.priceRange || ""} onValueChange={(value) => handleFilterChange('priceRange', value)}>
                <SelectTrigger className="w-full px-4 py-3 text-sm bg-neutral-900  border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white">
                  <SelectValue placeholder="All Prices" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900  border border-gray-600">
                  {priceFilterOptions.map(({ value, label }) =>
                    <SelectItem key={value} value={value} className="text-white hover:bg-gray-700">{label}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort By
              </label>
              <Select value={filters.sort || ""} onValueChange={(value) => handleFilterChange('sort', value)}>
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
          {(filters.categories.length > 0 || filters.brands.length > 0 || filters.priceRange || filters.sort) && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Active Filters
              </label>
              <div className="flex flex-wrap gap-2">
                {filters.categories.map(category => (
                  <div key={category} className="px-3 py-1 bg-orange-500 text-white text-sm rounded-full flex items-center gap-2">
                    <span>{category}</span>
                    <button
                      onClick={() => handleFilterChange('categories', filters.categories.filter(c => c !== category))}
                      className="hover:bg-orange-600 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {filters.brands.map(brand => (
                  <div key={brand} className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full flex items-center gap-2">
                    <span>{brand}</span>
                    <button
                      onClick={() => handleFilterChange('brands', filters.brands.filter(b => b !== brand))}
                      className="hover:bg-blue-600 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {filters.priceRange && (
                  <div className="px-3 py-1 bg-green-500 text-white text-sm rounded-full flex items-center gap-2">
                    <span>{filters.priceRange.replace('-', ' - ').replace('under', 'Under $').replace('over', 'Over $')}</span>
                    <button
                      onClick={() => handleFilterChange('priceRange', '')}
                      className="hover:bg-green-600 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {filters.sort && (
                  <div className="px-3 py-1 bg-gray-800 text-white text-sm rounded-full flex items-center gap-2">
                    <span>{filters.sort.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <button
                      onClick={() => handleFilterChange('sort', '')}
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
