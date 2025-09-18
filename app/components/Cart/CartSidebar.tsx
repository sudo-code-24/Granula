"use client";

import React from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { closeCart, removeFromCart, updateQuantity, clearCart } from '@/lib/store/cartSlice';
import { ShoppingCart, X } from 'lucide-react';
import { CartItemCard, CartSidebarFooter } from '.';
import { Button } from '@/components/ui/button';
import { ClientOnly } from '@/components/ClientOnly';

export default function CartSidebar() {
  const dispatch = useAppDispatch();
  const { items, totalItems, totalPrice, isOpen } = useAppSelector((state) => state.cart);

  if (!isOpen) return null;

  return (
    <ClientOnly>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => dispatch(closeCart())}
        />

        {/* Sidebar */}
        <div className="absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-xl">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">
                Shopping Cart ({totalItems})
              </h2>

              <Button
                onClick={() => dispatch(closeCart())}
                variant={"ghost"}
                className="p-1 hover:bg-muted rounded"
              >
               <X/>
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ShoppingCart />
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <p className="text-sm">Add some products to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const discountedPrice = item.product.price - (item.product.price * item.product.discountPercentage / 100);
                    return (
                      <CartItemCard key={item.id} item={item} discountedPrice={discountedPrice} />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <CartSidebarFooter totalPrice={totalPrice} />
            )}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
