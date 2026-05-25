import api from "@/lib/api";
import { PRODUCT_ENDPOINTS } from "@/constants/endpoints";
import { ApiProduct } from "@/hooks/useProducts";
import type { WebsiteConfig } from "@/lib/homeDataFetcher";
import FeaturedDuoSectionClient from "@/components/home/FeaturedDuoSectionClient";

interface Props {
  config: WebsiteConfig;
}

export default async function FeaturedDuoSection({ config }: Props) {
  let products: ApiProduct[] = [];

  // Priority 1: products tagged with the "featured" product type
  try {
    const res = await api.get<{ products: ApiProduct[]; total: number }>(
      `${PRODUCT_ENDPOINTS.BASE}?productTypes=featured&limit=2`,
    );
    products = res.data.products ?? [];
  } catch {
    // ignore
  }

  // Priority 2: fall back to items 5–6 (skip the 4 shown in New In)
  if (!products.length) {
    try {
      // page=3, limit=2 → skip first 4 items → products 5 & 6
      const res = await api.get<{ products: ApiProduct[]; total: number }>(
        `${PRODUCT_ENDPOINTS.BASE}?limit=2&sortBy=createdAt&sortOrder=desc&page=3`,
      );
      products = res.data.products ?? [];
    } catch {
      // silently fail
    }
  }

  if (!products.length) return null;

  return <FeaturedDuoSectionClient products={products} config={config} />;
}
