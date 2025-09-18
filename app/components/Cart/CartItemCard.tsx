import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/lib/hooks";
import { removeFromCart, updateItemQuantity } from "@/lib/store/cartSlice";
import { CartItem } from "@/types/cart";
import { Trash } from "lucide-react";
import React from "react";

interface CartItemProps {
    item: CartItem;
    discountedPrice: number;
}

export default function CartItemCard({ item, discountedPrice }: CartItemProps) {
    const dispatch = useAppDispatch();
    return (
        <div key={item.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
            <img
                src={item.product.thumbnail || item.product.images[0]}
                alt={item.product.title}
                className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm line-clamp-2">{item.product.title}</h3>
                {/* <p className="text-sm text-muted-foreground">{item.product.brand}</p> */}
                <p className="text-sm font-medium">${discountedPrice.toFixed(2)}</p>

                <div className="flex items-center gap-2 mt-2">

                    <Button variant='ghost' size='icon'
                        onClick={() => dispatch(updateItemQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                        className="w-6 h-6 flex items-center justify-center bg-muted rounded text-sm">
                        -
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button variant='ghost' size='icon'
                        onClick={() => dispatch(updateItemQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                        className="w-6 h-6 flex items-center justify-center bg-muted rounded text-sm">
                        +
                    </Button>
                    <Button variant='ghost' size='icon'
                        onClick={() => dispatch(removeFromCart({ id: item.id }))}
                        className="ml-auto p-1 text-muted-foreground hover:text-destructive">
                        <Trash />
                    </Button>
                </div>
            </div>
        </div>
    );
}
