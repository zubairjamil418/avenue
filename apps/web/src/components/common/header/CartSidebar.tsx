"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Link, useRouter } from "@/i18n/routing";
import { ShoppingCart, X } from "lucide-react";
import { useHeaderStore } from "@/store/useHeaderStore";
import { useCartStore } from "@/store/useCartStore";
import CartSidebarItem from "./CartSidebarItem";

const CartSidebar = () => {
  const { isCartOpen, onCartClose } = useHeaderStore();
  const { cartItems, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const router = useRouter();

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && onCartClose()}>
      <SheetContent
        side="right"
        className="flex flex-col w-full sm:max-w-[480px] p-0 border-none overflow-hidden shadow-xl"
        showCloseButton={false}
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between px-8 py-5 border-b border-[var(--gray-200)] bg-white sticky top-0 z-10 space-y-0">
          <div className="flex flex-col gap-1">
            <SheetTitle style={{ fontFamily: "'Playfair Display', var(--font-playfair), serif", fontSize: "1.05rem", fontWeight: 400, color: "#000" }}>
              Shopping Cart
              <span style={{ fontFamily: "var(--font-poppins), sans-serif", fontSize: "0.75rem", color: "var(--gray-500)", fontWeight: 400, marginLeft: "0.5rem" }}>({cartItems.length} items)</span>
            </SheetTitle>
          </div>
          <button onClick={onCartClose} className="text-[var(--gray-600)] hover:text-black transition-colors">
            <X className="size-5" />
          </button>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <CartSidebarItem
                key={item.id}
                item={item}
                onCartClose={onCartClose}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-20">
              <ShoppingCart className="size-12 text-[var(--gray-400)]" />
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 400 }}>Your cart is empty</p>
              <button onClick={onCartClose}
                style={{ padding: "0.75rem 2rem", border: "1px solid #000", background: "transparent", fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 pb-10 border-t border-border bg-background sticky bottom-0 z-10 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-base font-bold text-foreground">
                Sub Total
              </span>
              <span className="text-xl font-bold text-foreground">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { onCartClose(); router.push("/cart"); }}
                style={{ padding: "0.85rem", border: "1px solid #000", background: "transparent", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontWeight: 400 }}>
                View Cart
              </button>
              <button
                onClick={() => { onCartClose(); router.push("/checkout"); }}
                style={{ padding: "0.85rem", background: "#000", color: "#fff", border: "1px solid #000", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontWeight: 400 }}>
                Checkout
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;
