"use client";

import React from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import Container from "@/components/common/Container";
import { ApiProduct } from "@/hooks/useProducts";
import { ArrowUpRight } from "lucide-react";

function getCategorySlug(product: ApiProduct): string {
  const cat = product.category as any;
  if (!cat) return '';
  return cat.slug ?? '';
}

function getCategoryName(product: ApiProduct): string {
  const cat = product.category as any;
  if (!cat) return product.name;
  return cat.name ?? product.name;
}

interface NewInSectionClientProps {
  title: string;
  description?: string;
  buttonLabel?: string;
  buttonHref?: string;
  products: ApiProduct[];
  totalCount?: number;
}

export default function NewInSectionClient({
  title,
  description,
  buttonLabel = "Shop New In",
  buttonHref = "/shop",
  products,
  totalCount,
}: NewInSectionClientProps) {
  return (
    <section className="py-10 md:py-14 lg:py-[70px]">
      <Container>
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-16 items-start">

          {/* Left: text + CTA */}
          <motion.div
            className="w-full lg:w-[280px] xl:w-[320px] shrink-0 flex flex-col gap-4 lg:gap-5"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {totalCount !== undefined && (
              <span className="text-xs font-semibold tracking-[0.15em] uppercase text-light-secondary-text">
                Newly added Featured Items
              </span>
            )}

            <h2 className="font-['Urbanist',sans-serif] text-[28px] sm:text-[36px] md:text-[44px] lg:text-[48px] font-bold leading-[1.1] text-light-primary-text">
              {title}
            </h2>

            {description && (
              <p className="text-light-secondary-text text-[16px] leading-[26px] font-normal">
                {description}
              </p>
            )}

            <Link
              href={buttonHref as "/shop"}
              className="inline-flex items-center gap-3 border border-light-primary-text text-light-primary-text font-['DM_Sans',sans-serif] font-semibold text-[13px] tracking-[0.12em] uppercase py-[14px] px-[24px] w-max hover:bg-light-primary-text hover:text-white transition-colors duration-300 mt-2 group"
            >
              {buttonLabel}
              <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </Link>
          </motion.div>

          {/* Right: 4 product images */}
          <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {products.slice(0, 4).map((product, i) => (
              <motion.div
                key={product._id}
                className="flex flex-col gap-2 sm:gap-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link href={`/product/${product.slug}` as "/product/[slug]"}>
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 w-full">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">
                        No image
                      </div>
                    )}
                  </div>
                </Link>
                {getCategorySlug(product) ? (
                  <Link
                    href={`/shop?category=${getCategorySlug(product)}` as any}
                    className="font-['DM_Sans',sans-serif] text-[12px] sm:text-[13px] md:text-[14px] font-semibold text-light-primary-text text-center line-clamp-1 hover:text-primary transition-colors"
                  >
                    {getCategoryName(product)}
                  </Link>
                ) : (
                  <p className="font-['DM_Sans',sans-serif] text-[12px] sm:text-[13px] md:text-[14px] font-semibold text-light-primary-text text-center line-clamp-1">
                    {getCategoryName(product)}
                  </p>
                )}
              </motion.div>
            ))}
          </div>

        </div>
      </Container>
    </section>
  );
}
