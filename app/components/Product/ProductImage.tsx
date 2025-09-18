import React from "react";

interface ProductImageProps {
  src: string;
  title: string;
}

export default function ProductImage({ src, title }: ProductImageProps) {
  return (
    <img
      src={src || "https://via.placeholder.com/300x200"}
      alt={title}
      className="rounded-xl mb-4 w-full h-48 object-cover hover:scale-105 transition-transform"
    />
  );
}
