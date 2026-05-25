import React from "react";
import { ApiProduct } from "@/hooks/useProducts";
import { ProductType } from "@/hooks/useProductTypes";
import { setRequestLocale } from "next-intl/server";
import TopSellingProductsClient from "./TopSellingProductsClient";

interface TopSellingProductsProps {
  slug?: string;
  productType?: ProductType;
  locale?: string;
  title?: string;
  description?: string;
  /** Pre-fetched products passed from the page — avoids double-fetch waterfall */
  products?: ApiProduct[];
}

const TopSellingProducts = async ({
  slug = "top-selling-products",
  productType,
  locale,
  title,
  description,
  products: prefetchedProducts,
}: TopSellingProductsProps) => {
  if (locale) setRequestLocale(locale);

  const products = prefetchedProducts ?? [];

  if (products.length === 0) {
    return null;
  }

  return (
    <TopSellingProductsClient
      products={products}
      productType={productType}
      slug={slug}
      title={title}
      description={description}
    />
  );
};

export default TopSellingProducts;
