import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BrandAPI } from '@/lib/api/brands';
import { CategoryAPI } from '@/lib/api/categories';
import { Category, Brand } from '@/types/product';

interface ProductFilterProps {
  children?: React.ReactNode;
  className?: string;
}

export default function ProductFilter() {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('');

  // Fetch categories and brands on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesData, brandsData] = await Promise.all([
          CategoryAPI.getCategories(true),
          BrandAPI.getBrands(true)
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    <div>
      {/* Search and Filter Section */}
      <div className="mb-6">
        {/* Top Section - Search Bar and Primary Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
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

          {/* Primary Filter Dropdowns */}
          <div className="flex gap-3">
           
          </div>
        </div>

        {/* Bottom Section - Active Filter Tags */}
        <div className="flex flex-wrap gap-2">
          {/* Active Filter Tags - These would be dynamically generated based on selected filters */}
          <div className="px-3 py-1 bg-orange-500 text-white text-sm rounded-full flex items-center gap-2">
            <span>Electronics</span>
            <button className="hover:bg-orange-600 rounded-full p-0.5">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Clear All Filters Button */}
          <button className="px-3 py-1 bg-red-500/20 text-red-300 text-sm rounded-full hover:bg-red-500/30 transition-colors flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}