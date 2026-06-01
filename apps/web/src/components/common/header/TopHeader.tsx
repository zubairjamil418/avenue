"use client";
import React from "react";
import Container from "../Container";
import { Link } from "@/i18n/routing";
import { useAuthStore } from "@/store/useAuthStore";
import { useHeaderStore } from "@/store/useHeaderStore";

const TopHeader = () => {
  const { onAuthOpen } = useHeaderStore();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="bg-primary-light header-top relative z-60 py-1.5">
      <Container>
        <div className="flex items-center justify-center">
          {/* Left section — hidden for now */}
          {/* <div className="xl:flex items-center gap-x-6 hidden">
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
          </div> */}

          {/* Centre — reward promo */}
          <p className="flex items-center justify-center gap-x-1.5 text-primary-foreground text-xs sm:text-sm font-thin">
            Earn the rewards of new user.{" "}
            {isAuthenticated ? null : (
              <Link
                href="/user/dashboard"
                onClick={() => onAuthOpen("login")}
                className="font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                Join now
              </Link>
            )}
          </p>

          {/* Right section — hidden for now */}
          {/* <div className="hidden lg:flex">
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
                  href={isAuthenticated ? "/user/wishlist" : "/wishlist-style-v1"}
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
                <Link href="/order-tracking" className="topHeaderNavBtn border-r-0">
                  {t("topNav.tracking")}
                </Link>
              </li>
            </ul>
          </div> */}
        </div>
      </Container>
    </div>
  );
};

export default TopHeader;
