export interface PriceDetails {
  originalPrice: number;
  discountedPrice: number;
  discountAmount: number;
  discountPercentage: number;
}

/**
 * Global utility to calculate product prices accurately from various fallback models.
 * Ensures identical price structures across Product Cards, Cart, Checkout, and Success.
 */
export function calculateProductPrice(product: any): PriceDetails {
  if (!product) {
    return {
      originalPrice: 0,
      discountedPrice: 0,
      discountAmount: 0,
      discountPercentage: 0,
    };
  }

  // 1. Detect base original price
  const pOldPrice = product.price || product.oldPrice || 0;

  // 2. Detect discount percentage
  const pDiscountPercentage = product.discountPercentage || product.discount || 0;

  // 3. Determine definitive discounted price
  let pCurrentPrice = product.currentPrice;
  if (pCurrentPrice === undefined || pCurrentPrice === null) {
    pCurrentPrice = parseFloat((pOldPrice * (1 - pDiscountPercentage / 100)).toFixed(2));
  }

  // If product just has a currentPrice and no oldPrice, make oldPrice match currentPrice to prevent negative discounts
  const definitiveOriginalPrice = pOldPrice < pCurrentPrice ? pCurrentPrice : pOldPrice;
  const definitiveDiscountAmount = parseFloat((definitiveOriginalPrice - pCurrentPrice).toFixed(2));

  return {
    originalPrice: definitiveOriginalPrice,
    discountedPrice: pCurrentPrice,
    discountAmount: definitiveDiscountAmount > 0 ? definitiveDiscountAmount : 0,
    discountPercentage: pDiscountPercentage,
  };
}

export interface CartTotals {
  subtotalOriginal: number; // Subtotal if no discounts were applied
  subtotalDiscounted: number; // The subtotal after discount
  totalDiscount: number; // The sum of (original - discounted) * quantity
  vatPercentage: number;
  taxAmount: number;
  shippingCost: number;
  totalPayable: number;
}

/**
 * Global utility to calculate cart totals (Subtotal, Discount, VAT, Shipping, Total)
 */
export function calculateCartTotals(cartItems: any[]): CartTotals {
  let subtotalOriginal = 0;
  let subtotalDiscounted = 0;
  let totalDiscount = 0;

  cartItems.forEach((item) => {
    if (item?.product) {
      const prices = calculateProductPrice(item.product);
      const qty = item.quantity || 1;
      subtotalOriginal += prices.originalPrice * qty;
      subtotalDiscounted += prices.discountedPrice * qty;
      totalDiscount += prices.discountAmount * qty;
    }
  });

  const vatPercentage = Number(process.env.NEXT_PUBLIC_VAT_PERCENTAGE || 0);
  const taxAmount = subtotalDiscounted * (vatPercentage / 100);
  
  const shippingCost = Number(process.env.NEXT_PUBLIC_SHIPPING_COST || 0);
  // Optional free delivery threshold override could go here:
  // e.g. if (subtotalDiscounted >= 60.0) shippingCost = 0;
  // Based on your application design logic

  const totalPayable = subtotalDiscounted + taxAmount + shippingCost;

  return {
    subtotalOriginal,
    subtotalDiscounted,
    totalDiscount,
    vatPercentage,
    taxAmount,
    shippingCost,
    totalPayable,
  };
}
