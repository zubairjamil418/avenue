import Hero from "@/components/home/Hero";
import SupportInfo from "@/components/home/SupportInfo";
import ShopByCategory from "@/components/home/ShopByCategory";
import OurProducts from "@/components/home/OurProducts";
import HotDealsWeek from "@/components/home/HotDealsWeek";
import BeautyProducts from "@/components/home/BeautyProducts";
import BottomPromoBanners from "@/components/home/BottomPromoBanners";
import LatestBlogs from "@/components/home/LatestBlogs";
import HomePromoBanners from "@/components/home/HomePromoBanners";
import NewlyLaunchedProducts from "@/components/home/NewlyLaunchedProducts";
import BestSellingProducts from "@/components/home/BestSellingProducts";
import TopSellingProducts from "@/components/home/TopSellingProducts";
import {
  getHeroBanners,
  getHomeProductTypes,
  getProductsByTypeSlug,
  getOurProducts,
  getParentCategories,
  getLatestBlogs,
  getAdsBanners,
} from "@/lib/homeDataFetcher";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
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

/** Fetches top-selling products then renders the section */
const DeferredTopSelling = async ({
  locale,
  productTypes,
}: {
  locale: string;
  productTypes: ProductType[];
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
    />
  );
};

/** Fetches OurProducts + parent categories then renders the section */
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

/** Fetches promo ads banners then renders HomePromoBanners + BottomPromoBanners */
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

/** Fetches newly launched products then renders the section */
const DeferredNewlyLaunched = async ({
  locale,
  productTypes,
}: {
  locale: string;
  productTypes: ProductType[];
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
    />
  );
};

/** Fetches beauty products then renders the section */
const DeferredBeauty = async ({
  locale,
  productTypes,
}: {
  locale: string;
  productTypes: ProductType[];
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
    />
  );
};

/** Fetches latest blogs then renders the section */
const DeferredLatestBlogs = async ({ locale }: { locale: string }) => {
  const blogs = await getLatestBlogs("healthcare");
  return <LatestBlogs locale={locale} productBase="healthcare" blogs={blogs} />;
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const homeVersion = "home-1";

  /**
   * ✅ CRITICAL PATH — only 3 fast parallel fetches block the initial render:
   *    1. Hero banners  →  above-the-fold carousel (small payload)
   *    2. Best-selling products  →  first visible section (10 items)
   *    3. Product types  →  section labels / metadata (tiny lookup table)
   *
   * Everything else defers behind Suspense so Next.js streams the shell
   * to the browser immediately, then fills sections as they resolve.
   */
  const [heroSlides, productTypes, bestSellingProducts] = await Promise.all([
    getHeroBanners(homeVersion),
    getHomeProductTypes(homeVersion),
    getProductsByTypeSlug("best-selling", 10),
  ]);

  const findType = (slug: string) => productTypes.find((t) => t.slug === slug);

  return (
    <main>
      {/* ── CRITICAL: renders on first byte ──────────────────── */}
      <Hero initialSlides={heroSlides} homeVersionSlug={homeVersion} />
      <SupportInfo />

      <BestSellingProducts
        slug="best-selling"
        productType={findType("best-selling")}
        locale={locale}
        products={bestSellingProducts}
      />

      <Suspense fallback={<SectionSkeleton height="h-[300px]" />}>
        <ShopByCategory />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[520px]" />}>
        <DeferredTopSelling locale={locale} productTypes={productTypes} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[520px]" />}>
        <DeferredOurProducts locale={locale} />
      </Suspense>

      <Suspense fallback={null}>
        {/* Promo banners are a visual bonus — no height placeholder needed */}
        <DeferredPromoBanners />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
        <DeferredNewlyLaunched locale={locale} productTypes={productTypes} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[400px]" />}>
        <HotDealsWeek locale={locale} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
        <DeferredBeauty locale={locale} productTypes={productTypes} />
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[400px]" />}>
        <DeferredLatestBlogs locale={locale} />
      </Suspense>
    </main>
  );
}
