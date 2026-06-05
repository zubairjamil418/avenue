"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import Container from "@/components/common/Container";
import { ApiProduct } from "@/hooks/useProducts";

function getCategorySlug(product: ApiProduct): string {
  const cat = product.category as any;
  if (!cat) return "";
  return cat.slug ?? "";
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
    <section style={{ padding: "4rem var(--site-gutter)" }}>
      <Container>
        {/* Mobile: stacked, Desktop: 5-col grid (text + 4 images) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[320px_repeat(4,1fr)] gap-6 items-center">
          {/* Left col — full width on mobile */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1" style={{ maxWidth: "480px" }}>
            <p
              style={{
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "var(--gray-500)",
                marginBottom: "0.75rem",
              }}
            >
              Newly Featured Items
            </p>

            <h2
              style={{
                fontFamily: "'Poppins', var(--font-poppins), sans-serif",
                fontSize: "3rem",
                fontWeight: 400,
                lineHeight: 1.08,
                marginBottom: "1rem",
                color: "var(--black)",
              }}
            >
              {title}
            </h2>

            {description && (
              <p
                style={{
                  color: "var(--gray-600)",
                  lineHeight: 1.7,
                  marginBottom: "1.5rem",
                  fontSize: "0.95rem",
                }}
              >
                {description}
              </p>
            )}

            <Link
              href={buttonHref as "/shop"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem 2.5rem",
                fontSize: "0.8rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontWeight: 400,
                background: "transparent",
                color: "var(--black)",
                border: "1px solid var(--black)",
                borderRadius: "2px",
                transition: "all 0.3s",
                cursor: "pointer",
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

          {/* Right col — 4 products, each rendered as a direct grid child */}
          {products.slice(0, 4).map((product) => (
              <div key={product._id} style={{ textAlign: "center" }}>
                <Link href={`/product/${product.slug}` as "/product/[slug]"}>
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "3/4",
                      position: "relative",
                      overflow: "hidden",
                      background: "var(--gray-100)",
                    }}
                  >
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="200px"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--gray-400)",
                          fontSize: "0.8rem",
                        }}
                      >
                        No image
                      </div>
                    )}
                  </div>
                </Link>

                {getCategorySlug(product) ? (
                  <Link
                    href={`/shop?category=${getCategorySlug(product)}` as any}
                    style={{
                      display: "block",
                      marginTop: "0.6rem",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      color: "var(--black)",
                      textAlign: "center",
                      textDecoration: "none",
                    }}
                  >
                    {getCategoryName(product)}
                  </Link>
                ) : (
                  <p
                    style={{
                      marginTop: "0.6rem",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      color: "var(--black)",
                      textAlign: "center",
                    }}
                  >
                    {getCategoryName(product)}
                  </p>
                )}
              </div>
            ))}
        </div>
      </Container>
    </section>
  );
}
