"use client";

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { openCart, fetchCart } from '@/lib/store/cartSlice';
import {
  ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientOnly } from '@/components/ClientOnly';

export default function CartIcon() {
  const dispatch = useAppDispatch();
  const { totalItems, isLoading } = useAppSelector((state) => state.cart);

  // Fetch cart when component mounts
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  return (
    <Button 
      variant="outline" 
      onClick={() => dispatch(openCart())} 
      className="relative p-2 text-foreground hover:text-primary transition-colors"
      aria-label="Shopping Cart"
      disabled={isLoading}
    >
      <ShoppingCart />
      <ClientOnly>
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs font-medium">
            {totalItems}
          </span>
        )}
      </ClientOnly>
    </Button>
  );
}
