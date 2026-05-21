import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "../globals.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const publicSans = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-public-sans",
  display: "swap",
});

const urbanist = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-urbanist",
  display: "swap",
});
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import Header from "@/components/common/header/Header";
import Footer from "@/components/common/footer/Footer";
import { Toaster } from "@/components/ui/sonner";
import ComparePopup from "@/components/common/ComparePopup";
import UrlMessageHandler from "@/components/common/UrlMessageHandler";
import SourceCodeButton from "@/components/common/SourceCodeButton";
import api from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  let favicon = undefined;
  try {
    const iconRes = await api.get("/api/website-icons?category=favicon&isActive=true");
    const activeFavicon = iconRes.data?.data?.[0];
    if (activeFavicon?.url) {
      favicon = activeFavicon.url;
    }
  } catch (error) {
    console.error("Failed to fetch favicon", error);
  }

  return {
    title: {
      template: "Sellzy Ecommerce App | %s",
      default: "Sellzy Ecommerce App",
    },
    description: "Sellzy - Multipurpose eCommerce",
    ...(favicon && {
      icons: {
        icon: favicon,
        apple: favicon,
        shortcut: favicon,
      },
    }),
  };
}

export async function generateStaticParams() {
  return [
    { locale: "en" },
    { locale: "de" },
    { locale: "fr" },
    { locale: "it" },
    { locale: "en-SG" },
  ];
}

import { MENU_ENDPOINTS, CATEGORY_ENDPOINTS, CURRENCY_ENDPOINTS } from "@/constants/endpoints";
import CurrencyProvider from "@/components/common/CurrencyProvider";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Pre-fetch Header Data (Menus, Category Tree, Currencies) for "Instant" Render
  const [menusRes, categoriesRes, currenciesRes, messages] = await Promise.all([
    api.get(MENU_ENDPOINTS.PUBLIC, { next: { revalidate: 600 } }),
    api.get(CATEGORY_ENDPOINTS.TREE, { next: { revalidate: 600 } }),
    api
      .get(CURRENCY_ENDPOINTS.BASE, { next: { revalidate: 600 } })
      .catch(() => ({ data: { data: [] } })),
    getMessages(),
  ]);

  const initialMenus = menusRes.data || [];
  const initialCategoryTree = categoriesRes.data || [];
  const initialCurrencies = (currenciesRes.data as any)?.data || [];

  return (
    <html
      lang={locale}
      className={`${publicSans.variable} ${urbanist.variable}`}
    >
      <head></head>
      <body className="w-full overflow-x-hidden">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <CurrencyProvider initialCurrencies={initialCurrencies}>
            <UrlMessageHandler />
            <Header
              initialMenus={initialMenus}
              initialCategoryTree={initialCategoryTree}
            />
            {children}
            <Footer />
            <ComparePopup />
            <SourceCodeButton />
          </CurrencyProvider>
        </NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
