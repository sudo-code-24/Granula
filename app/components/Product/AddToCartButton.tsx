import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addToCart } from "@/lib/store/cartSlice";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "../LoadingSpinner";
import { ClientOnly } from "@/components/ClientOnly";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { Product } from "@/types/product";

interface AddToCartButtonProps {
  product: Product;
  stock: number;
}

export default function AddToCartButton({ product, stock }: AddToCartButtonProps) {
  const dispatch = useAppDispatch();
  const [isAdding, setIsAdding] = useState(false);
  const { handleError, success } = useErrorHandler();

  // Check if product is already in cart
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartItem = cartItems.find(item => item.productId === product.id);
  const isInCart = !!cartItem;

  const handleAddToCart = async () => {
    if (stock === 0 || isAdding) return;

    setIsAdding(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      dispatch(addToCart({ product, quantity: 1 }));
      success('Added to cart', `${product.title} has been added to your cart`);
    } catch (error) {
      handleError(error, 'Adding to Cart');
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button type="button" onClick={handleAddToCart}
      disabled={stock === 0 || isAdding} className={`w-full hover:scale-105 transition-transform ${stock === 0
        ? "bg-gray-700 text-gray-400"
        : isInCart
          ? "bg-green-600 text-white hover:bg-green-700"
          : isAdding
            ? "bg-amber-600 text-black"
            : "bg-amber-500 text-black hover:bg-amber-600"
        }`}>
      {isAdding ? <LoadingSpinner size="sm" /> : stock === 0 ?
        "Out of Stock" : (
          <ClientOnly fallback="Add to Cart">
            {isInCart ? `In Cart (${cartItem.quantity})` : "Add to Cart"}
          </ClientOnly>
        )}
    </Button >
  );
}
