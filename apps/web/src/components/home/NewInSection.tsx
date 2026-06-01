import api from "@/lib/api";
import { PRODUCT_ENDPOINTS } from "@/constants/endpoints";
import { ApiProduct } from "@/hooks/useProducts";
import type { WebsiteConfig } from "@/lib/homeDataFetcher";
import NewInSectionClient from "./NewInSectionClient";

interface NewInSectionProps {
  config: WebsiteConfig;
}

export default async function NewInSection({ config }: NewInSectionProps) {
  let products: ApiProduct[] = [];
  let totalCount: number | undefined;

  try {
    // Fetch enough to guarantee 4 unique categories after deduplication
    const response = await api.get<{ products: ApiProduct[]; total: number }>(
      `${PRODUCT_ENDPOINTS.BASE}?limit=40&sortBy=createdAt&sortOrder=desc`,
    );
    const all = response.data.products ?? [];
    totalCount = response.data.total;

    // Pick the newest product per unique category (up to 4)
    const seen = new Set<string>();
    for (const p of all) {
      const catId = typeof p.category === 'object' && p.category !== null
        ? (p.category as any)._id ?? (p.category as any).id ?? String(p.category)
        : String(p.category ?? '');
      if (catId && !seen.has(catId)) {
        seen.add(catId);
        products.push(p);
      }
      if (products.length === 4) break;
    }
    // Fall back to plain list if not enough distinct categories
    if (!products.length) products = all.slice(0, 4);
  } catch {
    // silently fail — component won't render if no products
  }

  if (!products.length) return null;

  const buttonHref = (config.settings?.adLink as string) || "/shop";
  const buttonLabel = (config.settings?.buttonLabel as string) || "Shop New In";

  return (
    <NewInSectionClient
      title={config.title}
      description={config.description}
      buttonLabel={buttonLabel}
      buttonHref={buttonHref}
      products={products}
      totalCount={totalCount}
    />
  );
}
