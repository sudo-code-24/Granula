import React from "react";

interface ProductPriceProps {
  price: number;
  discountPercentage: number;
  stock: number;
}

export default function ProductPrice({ price, discountPercentage, stock }: ProductPriceProps) {
  const discountedPrice = price - (price * discountPercentage) / 100;

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-2">
        <span className="text-xl font-bold text-green-400">
          ${discountedPrice.toFixed(2)}
        </span>
        {discountPercentage > 0 && (
          <>
            <span className="text-sm text-gray-500 line-through">
              ${price.toFixed(2)}
            </span>
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
              -{discountPercentage}%
            </span>
          </>
        )}
      </div>
      <span className="text-sm text-gray-400">
        {stock > 0 ? `${stock} in stock` : "Out of stock"}
      </span>
    </div>
  );
}
