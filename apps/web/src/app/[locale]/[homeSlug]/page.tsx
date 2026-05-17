import { notFound } from "next/navigation";
import api from "@/lib/api";
import {
  BANNER_PAGE_ENDPOINTS,
  CATEGORY_ENDPOINTS,
} from "@/constants/endpoints";
import { BannerPage } from "@/hooks/useBannerPages";
import { Category } from "@/hooks/useCategories";
import Hero from "@/components/home/Hero";
import ShopByCategoryBeauty from "@/components/home/beauty/ShopByCategoryBeauty";
import TodaysTopOffer from "@/components/home/beauty/TodaysTopOffer";
import MostLovedProducts from "@/components/home/beauty/MostLovedProducts";
import ShopByBrands from "@/components/home/beauty/ShopByBrands";
import ProductThreeColumnAdsBanner from "@/components/home/beauty/ProductThreeColumnAdsBanner";
import BeautyTopBrands from "@/components/home/beauty/BeautyTopBrands";
import TwoColumnAdsBanner from "@/components/home/beauty/TwoColumnAdsBanner";
import NewlyLaunchedProducts from "@/components/home/beauty/NewlyLaunchedProducts";
import OurProducts from "@/components/home/beauty/OurProducts";
import CategoryFavorites from "@/components/home/beauty/CategoryFavorites";
import BeautyCareProducts from "@/components/home/beauty/BeautyCareProducts";
import { setRequestLocale } from "next-intl/server";
import LatestBlogs from "@/components/home/LatestBlogs";
import { getLatestBlogs, getHeroBanners } from "@/lib/homeDataFetcher";
import { Suspense } from "react";
import { SectionSkeleton } from "@/components/ui/SectionSkeleton";

interface HomeVersionPageProps {
  params: Promise<{ homeSlug: string; locale: string }>;
}

export default async function HomeVersionPage({
  params,
}: HomeVersionPageProps) {
  const { homeSlug, locale } = await params;
  setRequestLocale(locale);

  // Fetch banner pages to validate this slug exists (with caching)
  let bannerPages: BannerPage[] = [];
  try {
    const res = await api.get<BannerPage[]>(BANNER_PAGE_ENDPOINTS.BASE, {
      next: { revalidate: 600 },
    });
    bannerPages = res.data;
  } catch (err) {
    console.error("Error fetching banner pages:", err);
  }

  // If slug doesn't match any known banner page, 404
  if (!bannerPages.some((p) => p.slug === homeSlug)) {
    notFound();
  }

  const isHome2 = homeSlug === "home-2";

  // Fetch Hero Banners + blogs in parallel using cached fetchers
  const [heroSlides, beautyBlogs] = await Promise.all([
    getHeroBanners(homeSlug),
    isHome2 ? getLatestBlogs("beauty") : Promise.resolve([]),
  ]);

  return (
    <main>
      <Hero initialSlides={heroSlides} homeVersionSlug={homeSlug} />
      {isHome2 && (
        <Suspense fallback={<SectionSkeleton height="h-[300px]" />}>
          <AsyncShopByCategoryBeauty homeSlug={homeSlug} />
        </Suspense>
      )}
      {isHome2 && (
        <Suspense fallback={<SectionSkeleton height="h-[400px]" />}>
          <TodaysTopOffer slug="todays-top-offer" locale={locale} />
        </Suspense>
      )}

      {isHome2 && (
        <Suspense fallback={<SectionSkeleton height="h-[400px]" />}>
          <ProductThreeColumnAdsBanner locale={locale} />
        </Suspense>
      )}
      {isHome2 && (
        <Suspense fallback={<SectionSkeleton height="h-[250px]" />}>
          <BeautyTopBrands locale={locale} />
        </Suspense>
      )}
      {isHome2 && (
        <Suspense fallback={<SectionSkeleton height="h-[300px]" />}>
          <TwoColumnAdsBanner locale={locale} />
        </Suspense>
      )}
      {isHome2 && (
        <Suspense fallback={<SectionSkeleton height="h-[520px]" />}>
          <NewlyLaunchedProducts locale={locale} />
        </Suspense>
      )}
      {isHome2 && (
        <Suspense fallback={<SectionSkeleton height="h-[520px]" />}>
          <AsyncOurProductsBeauty homeSlug={homeSlug} locale={locale} />
        </Suspense>
      )}
      {isHome2 && (
        <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
          <MostLovedProducts slug="most-loved-products" locale={locale} />
        </Suspense>
      )}

      {isHome2 && (
        <Suspense fallback={<SectionSkeleton height="h-[250px]" />}>
          <ShopByBrands locale={locale} />
        </Suspense>
      )}
      {isHome2 && (
        <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
          <AsyncCategoryFavorites homeSlug={homeSlug} />
        </Suspense>
      )}
      {isHome2 && (
        <Suspense fallback={<SectionSkeleton height="h-[450px]" />}>
          <BeautyCareProducts locale={locale} />
        </Suspense>
      )}
      {isHome2 && (
        <Suspense fallback={<SectionSkeleton height="h-[450px]" />}>
          <LatestBlogs
            locale={locale}
            productBase="beauty"
            blogs={beautyBlogs}
          />
        </Suspense>
      )}
    </main>
  );
}

// Internal Async Wrappers to allow Streaming for Home-2
const AsyncShopByCategoryBeauty = async ({
  homeSlug,
}: {
  homeSlug: string;
}) => {
  const res = await api.get<{ categories: Category[] }>(
    `${CATEGORY_ENDPOINTS.BASE}?bases=beauty&perPage=16`,
    { next: { revalidate: 600 } },
  );
  const categories = res.data.categories || [];
  return <ShopByCategoryBeauty categories={categories} />;
};

const AsyncOurProductsBeauty = async ({
  homeSlug,
  locale,
}: {
  homeSlug: string;
  locale: string;
}) => {
  const res = await api.get<{ categories: Category[] }>(
    `${CATEGORY_ENDPOINTS.BASE}?bases=beauty&perPage=16`,
    { next: { revalidate: 600 } },
  );
  const categories = res.data.categories || [];
  return <OurProducts categories={categories} locale={locale} />;
};

const AsyncCategoryFavorites = async ({ homeSlug }: { homeSlug: string }) => {
  const res = await api.get<{ categories: Category[] }>(
    `${CATEGORY_ENDPOINTS.BASE}?bases=beauty&perPage=16`,
    { next: { revalidate: 600 } },
  );
  const categories = res.data.categories || [];
  return (
    <CategoryFavorites
      categories={categories.filter((c) => c.isFavorite === true)}
    />
  );
};
