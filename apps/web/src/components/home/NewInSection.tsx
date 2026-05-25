import api from "@/lib/api";
import { PRODUCT_ENDPOINTS } from "@/constants/endpoints";
import { ApiProduct } from "@/hooks/useProducts";
import type { WebsiteConfig } from "@/lib/homeDataFetcher";
import NewInSectionClient from "./NewInSectionClient";

interface NewInSectionProps {
  config: WebsiteConfig;
}

export default async function NewInSection({ config }: NewInSectionProps) {
  const limit = 4;
  let products: ApiProduct[] = [];
  let totalCount: number | undefined;

  try {
    const response = await api.get<{ products: ApiProduct[]; total: number }>(
      `${PRODUCT_ENDPOINTS.BASE}?limit=${limit}&sortBy=createdAt&sortOrder=desc`,
    );
    products = response.data.products ?? [];
    totalCount = response.data.total;
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
