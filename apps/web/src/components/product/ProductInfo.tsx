"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SizeChartSidebar from "./SizeChartSidebar";
import { Share2, GitCompare, Minus, Plus, ShoppingCart } from "lucide-react";
import Ratings from "../common/products/Ratings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import WishlistBtn from "../common/products/WishlistBtn";
import { FullProduct } from "@/hooks/useProductBySlug";
import { useCartStore } from "@/store/useCartStore";
import { useCompareStore } from "@/store/useCompareStore";
import { toast } from "sonner";

interface ProductInfoProps {
  product: FullProduct;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] || null,
  );
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const router = useRouter();

  const addToCompare = useCompareStore((state) => state.addToCompare);
  const removeFromCompare = useCompareStore((state) => state.removeFromCompare);
  const compareItems = useCompareStore((state) => state.compareItems);
  const isCompared = compareItems.some(
    (item) => (item.id || item._id) === product._id,
  );

  const incrementQty = () => {
    if (quantity >= (product.stock || Infinity)) {
      toast.error("Cannot add more than available stock quantity.");
      return;
    }
    setQuantity((prev) => prev + 1);
  };
  const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const cartProduct = {
    id: product._id,
    title: product.name,
    rating: product.numReviews || 0,
    stars: product.averageRating || 0,
    currentPrice: product.price,
    oldPrice: product.oldPrice || product.price,
    discount: product.discountPercentage || 0,
    image: product.image,
    slug: product.slug,
  };

  const handleCompare = () => {
    if (isCompared) {
      removeFromCompare(product._id);
      toast.info(`${product.name} removed from compare`);
    } else {
      addToCompare(cartProduct);
      toast.success(`${product.name} added to compare`);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ url });
        toast.success("Shared successfully");
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        // User cancelled the share, don't show error
        toast.error("Failed to share");
      }
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full bg-white">
      {/* Category + wishlist */}
      <div className="flex items-center justify-between">
        {product.category?.name && (
          <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--gray-500)" }}>
            {product.category.name}
          </span>
        )}
        <WishlistBtn product={cartProduct} />
      </div>

      {/* Product name */}
      <h1 style={{ fontSize: "1.8rem", fontWeight: 400, color: "var(--black)", lineHeight: 1.2, marginBottom: "0.25rem" }}>
        {product.name}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-3">
        <Ratings rating={product.averageRating || 0} totalReviews={product.numReviews || 0} />
        {product.numReviews > 0 && (
          <span style={{ fontSize: "0.85rem", color: "var(--gray-500)" }}>({product.numReviews} reviews)</span>
        )}
      </div>

      {/* Price */}
      <div className="flex items-center gap-3" style={{ marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "1.25rem", fontWeight: 400, color: "var(--black)" }}>
          ${product.price?.toFixed(2)}
        </span>
        {product.oldPrice && product.oldPrice > product.price && (
          <span style={{ fontSize: "1rem", color: "var(--gray-400)", textDecoration: "line-through" }}>
            ${product.oldPrice.toFixed(2)}
          </span>
        )}
        {product.discountPercentage > 0 && (
          <span style={{ fontSize: "0.75rem", color: "var(--gray-600)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {product.discountPercentage}% off
          </span>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <p style={{ fontSize: "0.9rem", color: "var(--gray-600)", lineHeight: 1.7, marginBottom: "0.5rem" }}
          dangerouslySetInnerHTML={{ __html: product.description.replace(/<[^>]*>/g, " ").slice(0, 200) + (product.description.length > 200 ? "…" : "") }}
        />
      )}

      <div style={{ borderTop: "1px solid var(--gray-200)", width: "100%" }} />

      {/* Colors */}
      {product.colors && product.colors.length > 0 && (
        <div className="flex flex-col gap-3 w-full">
          <p style={{ fontSize: "0.8rem", color: "var(--gray-600)" }}>
            <strong style={{ color: "var(--black)" }}>Colour:</strong> {selectedColor?.name}
          </p>
          <div className="flex gap-2 flex-wrap">
            {product.colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color)}
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  backgroundColor: color.value,
                  border: selectedColor?.name === color.name ? "2px solid var(--black)" : "2px solid var(--gray-300)",
                  outline: selectedColor?.name === color.name ? "2px solid white" : "none",
                  outlineOffset: -4,
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center justify-between">
            <p style={{ fontSize: "0.8rem", color: "var(--gray-600)" }}>
              <strong style={{ color: "var(--black)" }}>Size:</strong> {selectedSize?.name}
            </p>
            <button onClick={() => setIsSizeChartOpen(true)}
              style={{ fontSize: "0.75rem", color: "var(--gray-500)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>
              Size guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size.name}
                onClick={() => setSelectedSize(size)}
                style={{
                  padding: "0.35rem 0.9rem",
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                  border: selectedSize?.name === size.name ? "1px solid var(--black)" : "1px solid var(--gray-300)",
                  background: selectedSize?.name === size.name ? "var(--black)" : "transparent",
                  color: selectedSize?.name === size.name ? "#fff" : "var(--black)",
                  cursor: "pointer",
                }}
              >
                {size.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity & Actions */}
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center gap-3">
          {/* Qty selector */}
          <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--gray-300)", height: 44 }}>
            <button onClick={decrementQty} style={{ width: 40, height: "100%", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "var(--black)" }}>−</button>
            <span style={{ width: 40, textAlign: "center", fontSize: "0.9rem", color: "var(--black)" }}>{quantity}</span>
            <button onClick={incrementQty} style={{ width: 40, height: "100%", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "var(--black)" }}>+</button>
          </div>
          {/* Add to Cart */}
          <button
            onClick={() => {
              const req = useCartStore.getState().addToCart(cartProduct, quantity, selectedColor, selectedSize);
              if (req) {
                toast.promise(req, {
                  loading: `Adding ${product.name} to cart...`,
                  success: `${product.name} added to cart`,
                  error: `Failed to add ${product.name} to cart`,
                  action: { label: "View Cart", onClick: () => { import("@/store/useHeaderStore").then((mod) => mod.useHeaderStore.getState().onCartOpen()); } },
                });
              }
            }}
            style={{
              flex: 1, height: 44, background: "var(--black)", color: "#fff",
              border: "none", fontSize: "0.75rem", letterSpacing: "0.15em",
              textTransform: "uppercase", fontWeight: 400, cursor: "pointer",
            }}
          >
            Add to Bag
          </button>
        </div>

        {/* Buy Now — outline */}
        <button
          onClick={() => {
            useCartStore.getState().addToCart(cartProduct, quantity, selectedColor, selectedSize);
            router.push("/checkout");
          }}
          style={{
            width: "100%", height: 44, background: "transparent", color: "var(--black)",
            border: "1px solid var(--black)", fontSize: "0.75rem", letterSpacing: "0.15em",
            textTransform: "uppercase", fontWeight: 400, cursor: "pointer",
          }}
        >
          Buy Now
        </button>

      </div>

      <div style={{ borderTop: "1px solid var(--gray-200)", width: "100%", marginTop: "0.5rem" }} />

      {/* Share & Compare */}
      <div className="flex items-center gap-4">
        <button onClick={handleShare}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", background: "none", border: "1px solid var(--gray-300)", width: 36, height: 36, justifyContent: "center", cursor: "pointer", color: "var(--black)" }}>
          <Share2 size={14} />
        </button>
        <button onClick={handleCompare}
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", background: "none", border: "1px solid var(--gray-300)", width: 36, height: 36, justifyContent: "center", cursor: "pointer", color: isCompared ? "var(--brand-orange)" : "var(--black)" }}>
          <GitCompare size={14} />
        </button>
        <span style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>Share or compare</span>
      </div>

      {/* Meta */}
      <div style={{ fontSize: "0.8rem", color: "var(--gray-500)", lineHeight: 2 }}>
        {product.sku && <p><strong style={{ color: "var(--black)", fontWeight: 500 }}>SKU:</strong> {product.sku}</p>}
        {product.category?.name && <p><strong style={{ color: "var(--black)", fontWeight: 500 }}>Category:</strong> {product.category.name}</p>}
        <p><strong style={{ color: "var(--black)", fontWeight: 500 }}>Delivery:</strong> Estimated 3–5 business days</p>
      </div>

      <SizeChartSidebar
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        category={product.category?.name || "General"}
      />
    </div>
  );
};

export default ProductInfo;
