import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

interface FilterTriggerProps {
  isOpen: boolean;
  onToggle: () => void;
  activeFiltersCount?: number;
}

export default function FilterTrigger({ isOpen, onToggle, activeFiltersCount = 0 }: FilterTriggerProps) {
  return (
    <Button
      onClick={onToggle}
      variant="outline"
      className="relative px-4 py-2 bg-neutral-900  border border-gray-600 text-white hover:bg-gray-700 transition-colors"
    >
      <Filter className="h-4 w-4 mr-2" />
      Filters
      {activeFiltersCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {activeFiltersCount}
        </span>
      )}
    </Button>
  );
}
