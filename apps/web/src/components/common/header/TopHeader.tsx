"use client";
import React from "react";
import Container from "../Container";
import { CirclePercent, Headset } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import LanguageToggle from "./LanguageToggle";
import CurrencyToggle from "./CurrencyToggle";
import { useAuthStore } from "@/store/useAuthStore";
import { useHeaderStore } from "@/store/useHeaderStore";

const TopHeader = () => {
  const t = useTranslations("Header");
  const locale = useLocale();
  const { onAuthOpen } = useHeaderStore();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="bg-primary-light header-top relative z-60">
      <Container>
        <div className="flex flex-col xl:flex-row items-center justify-between gap-y-2 lg:gap-y-0">
          <div className="xl:flex items-center gap-x-6 hidden">
            <p className="flex items-center gap-x-2 text-primary-foreground text-sm font-thin line-clamp-1">
              <span>
                <Headset className="size-5 text-primary-foreground" />
              </span>
              {t("needSupport")}
              <span>{t("callUs")}</span>
              <Link
                href="tel:(480)555-0103"
                className="bg-warning py-px px-2 text-xs leading-4.5 rounded-[60px] text-foreground"
              >
                (480) 555-0103
              </Link>
            </p>

            <ul className="flex items-center gap-2">
              <LanguageToggle />
              <div className="w-px h-6 bg-primary-foreground/70 mx-2" />
              <CurrencyToggle />
            </ul>
          </div>
          {locale === 'en' && (
            <div className="text-center py-2 xl:py-3.5">
              <p className="flex items-center justify-center gap-x-1.75 text-primary-foreground text-xs sm:text-sm font-thin line-clamp-1">
                <span className="inline-flex items-center">
                  <CirclePercent className="text-primary-foreground size-4 sm:size-5" />
                </span>
                {t("promotion.category")}
                <span className="bg-warning py-px px-2 text-[10px] sm:text-xs leading-4.5 rounded-[60px] text-foreground font-medium">
                  {t("promotion.off")}
                </span>
                {t("promotion.today")}
              </p>
            </div>
          )}

          <div className="hidden lg:flex">
            <ul className="flex items-center text-primary-foreground">
              <li>
                <Link href="/about" className="topHeaderNavBtn">
                  {t("topNav.about")}
                </Link>
              </li>
              <li>
                {isAuthenticated ? (
                  <Link href="/user/dashboard" className="topHeaderNavBtn">
                    My Account
                  </Link>
                ) : (
                  <button
                    onClick={() => onAuthOpen("login")}
                    className="topHeaderNavBtn"
                  >
                    {t("topNav.account")}
                  </button>
                )}
              </li>
              <li>
                <Link
                  href={
                    isAuthenticated ? "/user/wishlist" : "/wishlist-style-v1"
                  }
                  className="topHeaderNavBtn"
                >
                  {t("topNav.wishlist")}
                </Link>
              </li>
              <li>
                <Link href="/compare" className="topHeaderNavBtn">
                  {t("topNav.compare")}
                </Link>
              </li>
              <li>
                <Link
                  href="/order-tracking"
                  className="topHeaderNavBtn border-r-0"
                >
                  {t("topNav.tracking")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default TopHeader;
