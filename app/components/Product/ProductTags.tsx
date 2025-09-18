import React from "react";

interface ProductTagsProps {
  tags: string[];
}

export default function ProductTags({ tags }: ProductTagsProps) {
  return (
    <div className="flex flex-wrap gap-1 mb-3">
      {tags.slice(0, 3).map((tag, index) => (
        <span
          key={index}
          className="text-xs bg-gray-600/30 text-gray-300 px-2 py-1 rounded"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
