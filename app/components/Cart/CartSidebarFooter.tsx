import { useAppDispatch } from '@/lib/hooks';
import { clearCart } from '@/lib/store/cartSlice';
import React from 'react';

interface CardSidebarFooterProps {
  totalPrice: number;
  className?: string;
}

export default function CardSidebarFooter({ totalPrice }: CardSidebarFooterProps) {
  const dispatch = useAppDispatch();
  return (
    <div className="border-t border-border p-4 space-y-4">
      <div className="flex justify-between items-center text-lg font-semibold">
        <span>Total:</span>
        <span>${totalPrice.toFixed(2)}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => dispatch(clearCart())}
          className="flex-1 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition"
        >
          Clear Cart
        </button>
        <button
          onClick={() => {
            // TODO: Implement checkout
            alert('Checkout functionality coming soon!');
          }}
          className="flex-1 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}