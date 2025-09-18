import React from "react";

interface ProductBadgesProps {
  category: string;
  brand?: string;
}

export default function ProductBadges({ category, brand }: ProductBadgesProps) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
        {category}
      </span>
      {brand && (
        <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full">
          {brand}
        </span>
      )}
    </div>
  );
}
