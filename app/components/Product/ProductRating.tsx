import React from "react";

interface ProductRatingProps {
  rating: number;
  reviews: number;
}

export default function ProductRating({ rating, reviews }: ProductRatingProps) {
  return (
    <div className="flex items-center mb-2">
      <span className="text-yellow-400">★</span>
      <span className="text-sm text-gray-300 ml-1">{rating.toFixed(2)}</span>
      <span className="text-sm text-gray-500 ml-2">({reviews} reviews)</span>
    </div>
  );
}
