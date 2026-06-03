"use client";

import React, { useEffect, useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import { useBanners } from "@/hooks/useBanners";
import type { HeroBanner } from "@/types/banner";

interface HeroContentProps {
  homeVersionSlug?: string;
  compact?: boolean;
  initialSlides?: HeroBanner[];
}

const HeroContent = ({
  homeVersionSlug,
  compact = false,
  initialSlides = [],
}: HeroContentProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const { getBannersByTypeAndPage, isLoading } = useBanners();
  const pathname = usePathname();

  // If homeVersionSlug provided, use it. Otherwise map pathname to bannerPage slug
  // If pathname is "/" or empty (after stripping locale), it's home-1
  // Otherwise use the slug from the path (e.g., /home-2 -> home-2)
  // Remove locale prefix from pathname (e.g., /en/home-2 -> home-2)
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, "");
  const homeVersion = homeVersionSlug
    ? homeVersionSlug
    : pathWithoutLocale === "/" || pathWithoutLocale === ""
      ? "home-1"
      : pathWithoutLocale.replace(/^\//, "");

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const slides =
    initialSlides.length > 0
      ? initialSlides
      : getBannersByTypeAndPage("hero-banner", homeVersion);

  if (isLoading && initialSlides.length === 0) {
    return (
      <section className="overflow-hidden">
        <div className="w-full">
          <div className="w-full h-[450px] md:h-[600px] bg-gray-100 animate-pulse" />
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <section
      className={`overflow-hidden ${compact ? "pb-6" : "pb-0"}`}
    >
      <div className="w-full">
        <Carousel
          setApi={setApi}
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: false,
            }),
            Fade(),
          ]}
          opts={{
            loop: true,
            duration: 30,
          }}
          className="relative group w-full overflow-hidden transition-colors duration-700"
          style={{ backgroundColor: slides[current]?.bgColor || "#05535c" }}
        >
          <CarouselContent className="ml-0">
            {slides.map((slide: any) => (
              <CarouselItem
                key={slide._id}
                className={`pl-0 relative w-full ${compact ? "h-[300px] md:h-[470px]" : "h-[70vh]"}`}
                style={{ background: slide.videoUrl ? "#000" : undefined, overflow: "hidden" }}
              >
                {/* Video background */}
                {slide.videoUrl ? (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={slide.image}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      zIndex: 0,
                    }}
                  >
                    <source src={slide.videoUrl} type="video/mp4" />
                  </video>
                ) : (
                  /* Fallback: image background */
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${slide.image})` }}
                  />
                )}


                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    left: "var(--site-gutter)",
                    right: "var(--site-gutter)",
                    color: "white",
                    maxWidth: "540px",
                    zIndex: 2,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {slide.name && (
                    <p style={{
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.28em",
                      color: "rgba(255,255,255,0.85)",
                      marginBottom: "0.5rem",
                    }}>
                      {slide.name}
                    </p>
                  )}

                  <h1 style={{
                    fontFamily: "'Poppins', var(--font-poppins), sans-serif",
                    fontSize: "clamp(2.5rem, 5vw, 4rem)",
                    fontWeight: 400,
                    color: "#ffffff",
                    lineHeight: 1.1,
                    marginBottom: "1.5rem",
                  }}>
                    {slide.title}
                  </h1>

                  {slide.description && (
                    <p style={{
                      fontSize: "1rem",
                      color: "rgba(255,255,255,0.85)",
                      lineHeight: 1.7,
                      marginBottom: "1.25rem",
                      maxWidth: "420px",
                    }}>
                      {slide.description}
                    </p>
                  )}

                  <div style={{ marginTop: "1.25rem" }}>
                    <Link
                      href={slide.buttonHref || "#"}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1rem 2.5rem",
                        fontSize: "0.8rem",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        fontWeight: 400,
                        background: "#000000",
                        color: "#ffffff",
                        borderRadius: "2px",
                        textDecoration: "none",
                        transition: "background 0.3s",
                      }}
                    >
                      {slide.buttonTitle || "Shop Now"}
                    </Link>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

        </Carousel>
      </div>
    </section>
  );
};

interface HeroProps {
  homeVersionSlug?: string;
  compact?: boolean;
  initialSlides?: HeroBanner[];
}

const Hero = ({
  homeVersionSlug,
  compact = false,
  initialSlides = [],
}: HeroProps) => {
  return (
    <Suspense
      fallback={
        <section
          className={`overflow-hidden ${compact ? "pb-6" : "pb-0"}`}
        >
          <div className="w-full">
            <div
              className={`w-full bg-gray-100 animate-pulse ${compact ? "h-[300px] md:h-[360px]" : "h-[450px] md:h-[600px]"}`}
            />
          </div>
        </section>
      }
    >
      <HeroContent
        homeVersionSlug={homeVersionSlug}
        compact={compact}
        initialSlides={initialSlides}
      />
    </Suspense>
  );
};

export default Hero;
