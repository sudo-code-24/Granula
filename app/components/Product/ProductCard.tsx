import React from 'react';
import { Product } from '@/types/product';
import { AddToCartButton, ProductBadges, ProductImage, ProductPrice, ProductRating, ProductTags, ProductTitle } from '.';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const discountedPrice = product.price - (product.price * product.discountPercentage / 100);

  return (
    <div className={`bg-neutral-900 shadow-lg rounded-2xl p-4 hover:shadow-xl transition ${className}`}>
      <ProductImage src={product.thumbnail || product.images[0]} title={product.title} />
      <ProductBadges category={product.category.name} brand={product.brand.name} />
      <ProductTitle title={product.title} description={product.description} />
      <ProductRating rating={product.rating} reviews={product.reviews.length} />
      <ProductPrice price={product.price} discountPercentage={product.discountPercentage} stock={product.stock} />
      <ProductTags tags={product.tags} />
      <AddToCartButton product={product} stock={product.stock} />
    </div>
  );
}