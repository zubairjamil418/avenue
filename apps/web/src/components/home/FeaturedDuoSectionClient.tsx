"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import Container from "@/components/common/Container";
import { ApiProduct } from "@/hooks/useProducts";
import type { WebsiteConfig } from "@/lib/homeDataFetcher";

interface FeaturedDuoSectionClientProps {
  products: ApiProduct[];
  config: WebsiteConfig;
}

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
    .replace(/[,.]?$/, "") +
    (html.replace(/<[^>]*>/g, "").trim().length > maxLen ? "…" : "");
}

export default function FeaturedDuoSectionClient({
  products,
  config,
}: FeaturedDuoSectionClientProps) {
  const s = (config.settings ?? {}) as Record<string, string>;

  return (
    <section style={{ padding: "4rem var(--site-gutter)" }}>
      <Container>
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: "3rem" }}
        >
          {products.slice(0, 2).map((product, index) => {
            const image = product.images?.[0] || product.image;
            const brandName = product.brand?.name;
            const buttonLabel =
              s[`item${index + 1}ButtonLabel`] ||
              (brandName ? `Shop ${brandName}` : s.buttonLabel || "Shop Now");

            return (
              <div key={product._id} style={{ display: "flex", flexDirection: "column" }}>
                {/* Image */}
                <Link
                  href={`/product/${product.slug}` as "/product/[slug]"}
                  style={{ display: "block", marginBottom: "2rem" }}
                >
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "4/5",
                      position: "relative",
                      overflow: "hidden",
                      background: "var(--gray-100)",
                    }}
                  >
                    {image && (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLElement).style.transform = "scale(1.05)")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLElement).style.transform = "scale(1)")
                        }
                      />
                    )}
                  </div>
                </Link>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: "'Playfair Display', var(--font-playfair), serif",
                    fontSize: "1.8rem",
                    fontWeight: 400,
                    color: "var(--brand-black)",
                    marginBottom: "1rem",
                    lineHeight: 1.2,
                  }}
                >
                  {product.name}
                </h3>

                {/* Description */}
                {product.description && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--gray-600)",
                      lineHeight: 1.7,
                      marginBottom: "2rem",
                    }}
                  >
                    {plainText(product.description)}
                  </p>
                )}

                {/* Button */}
                <div>
                  <Link
                    href={`/product/${product.slug}` as "/product/[slug]"}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "240px",
                      padding: "0.75rem 1.75rem",
                      fontSize: "0.72rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      fontWeight: 400,
                      background: "transparent",
                      color: "var(--black)",
                      border: "1px solid var(--black)",
                      borderRadius: "2px",
                      transition: "all 0.3s",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--black)";
                      (e.currentTarget as HTMLElement).style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "var(--black)";
                    }}
                  >
                    {buttonLabel}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
