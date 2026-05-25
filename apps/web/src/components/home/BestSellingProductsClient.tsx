"use client";

import React from "react";
import { motion, Variants } from "motion/react";
import Container from "../common/Container";
import ProductCard from "../common/products/ProductCard";
import { ProductType } from "@/hooks/useProductTypes";
import { ApiProduct } from "@/hooks/useProducts";
import { ChevronRight, ChevronLeft } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

interface BestSellingProductsClientProps {
  products: ApiProduct[];
  productType?: ProductType;
  slug: string;
  title?: string;
  description?: string;
}

const BestSellingProductsClient = ({
  products,
  productType,
  slug,
  title,
  description,
}: BestSellingProductsClientProps) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(true);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());

    api.on("select", () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    });

    api.on("reInit", () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    });
  }, [api]);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-10 md:py-14 lg:py-[70px]">
      <Container>
        <div className="relative pt-0 pb-12 min-h-[500px]">

          {/* Notch Content (Title and Description) */}
          <div className="flex justify-center mb-10 overflow-visible relative z-10">
            <div className="relative px-6 sm:px-20 pt-4 pb-16 text-center max-w-max w-full flex flex-col gap-[4px] items-center">
              <h4 className="font-['Urbanist',sans-serif] text-2xl md:text-3xl lg:text-[40px] font-bold leading-tight lg:leading-[48px] text-light-primary-text mb-2">
                {title || productType?.title || "Best Selling Products"}
              </h4>
              {(description ?? productType?.description) && (
                <p className="text-gray-600 text-xs sm:text-[14px] font-normal leading-relaxed max-w-[280px] sm:max-w-none mx-auto">
                  {description ?? productType?.description}
                </p>
              )}
            </div>
          </div>

          {/* Product Carousel */}
          <div className="px-4 sm:px-6 lg:px-10 relative z-10 w-full">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <Carousel
                setApi={setApi}
                opts={{
                  align: "start",
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4 sm:-ml-5">
                  {products.map((product) => (
                    <CarouselItem
                      key={product._id}
                      className="pl-4 sm:pl-5 basis-full sm:basis-1/2 lg:basis-1/4 xl:basis-1/6"
                    >
                      <motion.div
                        className="w-full flex h-full"
                        variants={itemVariants}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </motion.div>
          </div>

          {/* Navigation Arrows at Bottom */}
          <div className="flex justify-center gap-4 mt-8 md:mt-10 relative z-10">
            <button
              onClick={() => api?.scrollPrev()}
              disabled={!canScrollPrev}
              className={`size-11 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                canScrollPrev
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-white/60 text-primary/50 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              onClick={() => api?.scrollNext()}
              disabled={!canScrollNext}
              className={`size-11 rounded-full flex items-center justify-center transition-colors shadow-lg ${
                canScrollNext
                  ? "bg-white text-primary hover:bg-white/90"
                  : "bg-white/60 text-primary/50 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="size-6" />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default BestSellingProductsClient;
