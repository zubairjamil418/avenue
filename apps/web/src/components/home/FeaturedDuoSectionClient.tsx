"use client";

import React from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import Container from "@/components/common/Container";
import { ApiProduct } from "@/hooks/useProducts";
import type { WebsiteConfig } from "@/lib/homeDataFetcher";
import { ArrowUpRight } from "lucide-react";

interface FeaturedDuoSectionClientProps {
  products: ApiProduct[];
  config: WebsiteConfig;
}

/** Strip HTML tags, decode common entities, and truncate to maxLen chars */
function plainText(html: string, maxLen = 140): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen)
    .trimEnd()
    .replace(/[,.]?$/, "") + (html.replace(/<[^>]*>/g, "").trim().length > maxLen ? "…" : "");
}

export default function FeaturedDuoSectionClient({
  products,
  config,
}: FeaturedDuoSectionClientProps) {
  const s = (config.settings ?? {}) as Record<string, string>;
  const defaultButtonLabel = s.buttonLabel || "Shop Now";

  return (
    <section className="py-10 md:py-14 lg:py-[70px]">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {products.slice(0, 2).map((product, index) => {
            const image = product.images?.[0] || product.image;
            const buttonLabel = s[`item${index + 1}ButtonLabel`] || defaultButtonLabel;
            return (
              <motion.div
                key={product._id}
                className="flex flex-col gap-4"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Image — links to product */}
                <Link
                  href={`/product/${product.slug}` as "/product/[slug]"}
                  className="block relative w-full aspect-[3/4] max-h-[60vh] overflow-hidden bg-gray-100 group"
                >
                  {image && (
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  )}
                </Link>

                {/* Content */}
                <div className="flex flex-col pt-2">
                  <h3 className="[font-family:var(--font-urbanist)] text-[1.8rem] font-semibold leading-tight text-light-primary-text mb-4">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="text-[0.85rem] text-gray-600 max-w-full mb-8 leading-[1.7]">
                      {plainText(product.description)}
                    </p>
                  )}

                  <div>
                    <Link
                      href={`/product/${product.slug}` as "/product/[slug]"}
                      className="inline-flex items-center justify-center gap-2 min-w-[240px] px-5 py-3 border border-light-primary-text text-xs font-semibold tracking-[0.12em] uppercase text-light-primary-text hover:bg-light-primary-text hover:text-white transition-colors duration-200"
                    >
                      {buttonLabel}
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
