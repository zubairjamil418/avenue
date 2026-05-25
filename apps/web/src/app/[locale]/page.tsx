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
import WebsiteConfigSections from "@/components/home/WebsiteConfigSections";
import NewInSection from "@/components/home/NewInSection";
import {
  getHeroBanners,
  getHomeProductTypes,
  getProductsByTypeSlug,
  getOurProducts,
  getParentCategories,
  getWebsiteConfigs,
  getAdsBanners,
} from "@/lib/homeDataFetcher";
import { Suspense } from "react";
import { SectionSkeleton } from "@/components/ui/SectionSkeleton";
import { ProductType } from "@/hooks/useProductTypes";
import type { AdsBanner } from "@/types/banner";

// ─── Ads banner helpers ───
function filterHealthcareBanners(adsBanners: AdsBanner[]): AdsBanner[] {
  return adsBanners.filter((banner) => {
    if (!banner.productBases || !Array.isArray(banner.productBases))
      return false;
    return banner.productBases.some((pb) => {
      if (typeof pb === "string") return pb.toLowerCase() === "healthcare";
      if (pb.slug) return pb.slug === "healthcare";
      if (pb.name) return pb.name.toLowerCase() === "healthcare";
      if (pb.title) return pb.title.toLowerCase() === "healthcare";
      return false;
    });
  });
}

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
  const products = await getProductsByTypeSlug("top-selling-products", 25);
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
    getOurProducts(),
    getParentCategories(),
  ]);
  return (
    <OurProducts
      locale={locale}
      initialProducts={products}
      parentCategories={categories}
    />
  );
};

const DeferredPromoBanners = async () => {
  const adsBanners = await getAdsBanners();
  const healthcare = filterHealthcareBanners(adsBanners);
  const bottom = healthcare.filter(isRowBanner);
  const home = healthcare.filter(
    (banner) => !bottom.find((bb) => bb._id === banner._id),
  );
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
  const products = await getProductsByTypeSlug("newly-lunch-products", 10);
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
  const products = await getProductsByTypeSlug("beauty-products", 8);
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

const DeferredLatestBlogs = async ({ locale }: { locale: string }) => {
  const configs = await getWebsiteConfigs("home");
  return <WebsiteConfigSections configs={configs} locale={locale} />;
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
  const configMap = new Map(websiteConfigs.map((c) => [c.componentType, c]));
  const show = (type: string) => configMap.get(type)?.isActive === true;
  const cfgTitle = (type: string) => configMap.get(type)?.title;
  const cfgDesc = (type: string) => configMap.get(type)?.description;

  const findType = (slug: string) => productTypes.find((t) => t.slug === slug);

  return (
    <main>
      {show("hero") && <Hero initialSlides={heroSlides} homeVersionSlug={homeVersion} />}
      {show("new-in") && configMap.get("new-in") && (
        <Suspense fallback={<SectionSkeleton height="h-[400px]" />}>
          <NewInSection config={configMap.get("new-in")!} />
        </Suspense>
      )}
      {show("support-info") && <SupportInfo />}

      {show("best-selling") && (
        <BestSellingProducts
          slug="best-selling"
          productType={findType("best-selling")}
          locale={locale}
          products={bestSellingProducts}
          title={cfgTitle("best-selling")}
          description={cfgDesc("best-selling")}
        />
      )}

      {show("shop-by-category") && (
        <Suspense fallback={<SectionSkeleton height="h-[300px]" />}>
          <ShopByCategory
            title={cfgTitle("shop-by-category")}
            description={cfgDesc("shop-by-category")}
          />
        </Suspense>
      )}

      {show("top-selling") && (
        <Suspense fallback={<SectionSkeleton height="h-[520px]" />}>
          <DeferredTopSelling
            locale={locale}
            productTypes={productTypes}
            title={cfgTitle("top-selling")}
            description={cfgDesc("top-selling")}
          />
        </Suspense>
      )}

      {show("our-products") && (
        <Suspense fallback={<SectionSkeleton height="h-[520px]" />}>
          <DeferredOurProducts locale={locale} />
        </Suspense>
      )}

      {show("promo-banners") && (
        <Suspense fallback={null}>
          <DeferredPromoBanners />
        </Suspense>
      )}

      {show("newly-launched") && (
        <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
          <DeferredNewlyLaunched
            locale={locale}
            productTypes={productTypes}
            title={cfgTitle("newly-launched")}
            description={cfgDesc("newly-launched")}
          />
        </Suspense>
      )}

      {show("hot-deals") && (
        <Suspense fallback={<SectionSkeleton height="h-[400px]" />}>
          <HotDealsWeek
            locale={locale}
            title={cfgTitle("hot-deals")}
            description={cfgDesc("hot-deals")}
          />
        </Suspense>
      )}

      {show("beauty") && (
        <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
          <DeferredBeauty
            locale={locale}
            productTypes={productTypes}
            title={cfgTitle("beauty")}
            description={cfgDesc("beauty")}
          />
        </Suspense>
      )}

      <Suspense fallback={<SectionSkeleton height="h-[400px]" />}>
        <DeferredLatestBlogs locale={locale} />
      </Suspense>
    </main>
  );
}
