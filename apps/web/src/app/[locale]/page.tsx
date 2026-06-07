import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/home/Hero";
import SupportInfo from "@/components/home/SupportInfo";
import ShopByCategory from "@/components/home/ShopByCategory";
import OurProducts from "@/components/home/OurProducts";
import HotDealsWeek from "@/components/home/HotDealsWeek";
import BeautyProducts from "@/components/home/BeautyProducts";
import BottomPromoBanners from "@/components/home/BottomPromoBanners";
import HomePromoBanners from "@/components/home/HomePromoBanners";
import NewlyLaunchedProducts from "@/components/home/NewlyLaunchedProducts";
import BestSellingProducts from "@/components/home/BestSellingProducts";
import TopSellingProducts from "@/components/home/TopSellingProducts";
import LatestBlogs from "@/components/home/LatestBlogs";
import NewsletterForm from "@/components/home/NewsletterForm";
import InStoreSection from "@/components/home/InStoreSection";
import NewInSection from "@/components/home/NewInSection";
import FeaturedDuoSection from "@/components/home/FeaturedDuoSection";
import ShopFavoriteCategories from "@/components/home/ShopFavoriteCategories";
import {
  getHeroBanners,
  getHomeProductTypes,
  getProductsByTypeSlug,
  getOurProducts,
  getParentCategories,
  getWebsiteConfigs,
  getAdsBanners,
  getLatestBlogs,
} from "@/lib/homeDataFetcher";
import { Suspense } from "react";
import { SectionSkeleton } from "@/components/ui/SectionSkeleton";
import { ProductType } from "@/hooks/useProductTypes";
import type { AdsBanner } from "@/types/banner";

// ─── Ads banner helpers ───
function isRowBanner(banner: AdsBanner): boolean {
  if (!banner.productTypes || !Array.isArray(banner.productTypes)) return false;
  return banner.productTypes.some((pt) => {
    if (typeof pt === "string")
      return (
        pt.toLowerCase() === "two-row-banner" ||
        pt.toLowerCase() === "tow-row-banner"
      );
    if (pt.slug)
      return pt.slug === "two-row-banner" || pt.slug === "tow-row-banner";
    if (pt.name) {
      const n = pt.name.toLowerCase();
      return n.includes("tow-row") || n.includes("two ") || n.includes("tow ");
    }
    return false;
  });
}

function withTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
  return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))]);
}

const DeferredTopSelling = async ({
  locale,
  productTypes,
  title,
  description,
}: {
  locale: string;
  productTypes: ProductType[];
  title?: string;
  description?: string;
}) => {
  const products = await withTimeout(getProductsByTypeSlug("top-selling-products", 25)).catch(() => []);
  const productType = productTypes.find(
    (t) => t.slug === "top-selling-products",
  );
  if (!products.length) return null;
  return (
    <TopSellingProducts
      slug="top-selling-products"
      productType={productType}
      locale={locale}
      products={products}
      title={title}
      description={description}
    />
  );
};

const DeferredOurProducts = async ({ locale }: { locale: string }) => {
  const [products, categories] = await Promise.all([
    withTimeout(getOurProducts()).catch(() => []),
    withTimeout(getParentCategories()).catch(() => []),
  ]);
  return (
    <OurProducts
      locale={locale}
      initialProducts={products}
      parentCategories={categories}
    />
  );
};

const DeferredPromoBanners = async ({ cfg }: { cfg: any }) => {
  const all = await withTimeout(getAdsBanners()).catch(() => []);
  // If specific banners are assigned in the config, use only those; otherwise use all
  const bannerIds: string[] = cfg?.settings?.bannerIds || [];
  if (!bannerIds.length) return null;
  const pool = all.filter((b) => bannerIds.includes(b._id));
  const bottom = pool.filter(isRowBanner);
  const home = pool.filter((b) => !bottom.find((bb) => bb._id === b._id));
  return (
    <>
      {home.length > 0 && <HomePromoBanners banners={home.slice(0, 2)} />}
      {bottom.length > 0 && <BottomPromoBanners banners={bottom.slice(0, 2)} />}
    </>
  );
};

const DeferredNewlyLaunched = async ({
  locale,
  productTypes,
  title,
  description,
}: {
  locale: string;
  productTypes: ProductType[];
  title?: string;
  description?: string;
}) => {
  const products = await withTimeout(getProductsByTypeSlug("newly-lunch-products", 10)).catch(() => []);
  const productType = productTypes.find(
    (t) => t.slug === "newly-lunch-products",
  );
  if (!products.length) return null;
  return (
    <NewlyLaunchedProducts
      slug="newly-lunch-products"
      productType={productType}
      locale={locale}
      products={products}
      title={title}
      description={description}
    />
  );
};

const DeferredBeauty = async ({
  locale,
  productTypes,
  title,
  description,
}: {
  locale: string;
  productTypes: ProductType[];
  title?: string;
  description?: string;
}) => {
  const products = await withTimeout(getProductsByTypeSlug("beauty-products", 8)).catch(() => []);
  const productType = productTypes.find((t) => t.slug === "beauty-products");
  if (!products.length) return null;
  return (
    <BeautyProducts
      slug="beauty-products"
      productType={productType}
      locale={locale}
      products={products}
      title={title}
      description={description}
    />
  );
};

const DeferredBlogs = async ({ locale, cfg }: { locale: string; cfg: any }) => {
  const blogs = await withTimeout(getLatestBlogs()).catch(() => []);
  if (!blogs.length) return null;
  return <LatestBlogs locale={locale} blogs={blogs} title={cfg?.title} />;
};

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const homeVersion = "home-1";

  const [heroSlides, productTypes, bestSellingProducts, websiteConfigs] = await Promise.all([
    getHeroBanners(homeVersion),
    getHomeProductTypes(homeVersion),
    getProductsByTypeSlug("best-selling", 10),
    getWebsiteConfigs("home"),
  ]);

  // show(type): only show if an active config entry exists for this type.
  // No entry = hidden. The admin is the single source of truth.
  // Sort configs by weight so admin controls the order
  const orderedConfigs = [...websiteConfigs].sort((a, b) => a.weight - b.weight);
  const configMap = new Map(websiteConfigs.map((c) => [c.componentType, c]));
  const findType = (slug: string) => productTypes.find((t) => t.slug === slug);

  const renderSection = (cfg: (typeof orderedConfigs)[0]) => {
    if (!cfg.isActive) return null;
    const { _id, componentType: type, title, description } = cfg;

    switch (type) {
      case "hero":
        return <Hero key={_id} initialSlides={heroSlides} homeVersionSlug={homeVersion} />;

      case "new-in":
        return (
          <Suspense key={_id} fallback={<SectionSkeleton height="h-[400px]" />}>
            <NewInSection config={cfg} />
          </Suspense>
        );

      case "featured-duo":
        return <FeaturedDuoSection key={_id} config={cfg} />;

      case "shop-favorite-categories":
        return <ShopFavoriteCategories key={_id} title={title || "What's Trending"} />;

      case "support-info":
        return <SupportInfo key={_id} />;

      case "best-selling":
        return (
          <BestSellingProducts
            key={_id}
            slug="best-selling"
            productType={findType("best-selling")}
            locale={locale}
            products={bestSellingProducts}
            title={title}
            description={description}
          />
        );

      case "shop-by-category":
        return (
          <Suspense key={_id} fallback={<SectionSkeleton height="h-[300px]" />}>
            <ShopByCategory title={title} description={description} />
          </Suspense>
        );

      case "top-selling":
        return (
          <Suspense key={_id} fallback={<SectionSkeleton height="h-[520px]" />}>
            <DeferredTopSelling locale={locale} productTypes={productTypes} title={title} description={description} />
          </Suspense>
        );

      case "our-products":
        return (
          <Suspense key={_id} fallback={<SectionSkeleton height="h-[520px]" />}>
            <DeferredOurProducts locale={locale} />
          </Suspense>
        );

      case "promo-banners":
        return (
          <Suspense key={_id} fallback={null}>
            <DeferredPromoBanners cfg={cfg} />
          </Suspense>
        );

      case "newly-launched":
        return (
          <Suspense key={_id} fallback={<SectionSkeleton height="h-[500px]" />}>
            <DeferredNewlyLaunched locale={locale} productTypes={productTypes} title={title} description={description} />
          </Suspense>
        );

      case "hot-deals":
        return (
          <Suspense key={_id} fallback={<SectionSkeleton height="h-[400px]" />}>
            <HotDealsWeek locale={locale} title={title} description={description} />
          </Suspense>
        );

      case "beauty":
        return (
          <Suspense key={_id} fallback={<SectionSkeleton height="h-[500px]" />}>
            <DeferredBeauty locale={locale} productTypes={productTypes} title={title} description={description} />
          </Suspense>
        );

      case "blogs":
        return (
          <Suspense key={_id} fallback={<SectionSkeleton height="h-[400px]" />}>
            <DeferredBlogs locale={locale} cfg={cfg} />
          </Suspense>
        );

      case "newsletter":
        return (
          <section key={_id} style={{ backgroundColor: cfg.settings?.backgroundColor || "#05535c", color: cfg.settings?.textColor || "#fff" }}>
            <div className="container mx-auto px-4 py-14 text-center">
              <h2 className="text-2xl font-bold mb-2">{title}</h2>
              {description && <p className="mb-6 opacity-80">{description}</p>}
              <NewsletterForm accentColor={cfg.settings?.backgroundColor || "#05535c"} />
            </div>
          </section>
        );

      case "in-store":
        return <InStoreSection key={_id} config={cfg} />;

      case "custom-html":
        if (!cfg.settings?.customHtml) return null;
        return (
          <div key={_id}>
            {cfg.settings.customCss && <style dangerouslySetInnerHTML={{ __html: cfg.settings.customCss }} />}
            <div dangerouslySetInnerHTML={{ __html: cfg.settings.customHtml }} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main>
      {orderedConfigs.map(renderSection)}
    </main>
  );
}
