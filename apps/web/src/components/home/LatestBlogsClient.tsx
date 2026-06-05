"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import Container from "../common/Container";
import { Blog } from "./LatestBlogs";

export default function LatestBlogsClient({ blogs, title = "Avenue Stories" }: { blogs: Blog[]; title?: string }) {
  const carouselRef = useRef<HTMLDivElement>(null);

  if (!blogs || blogs.length === 0) return null;

  return (
    <section style={{ padding: "4rem var(--site-gutter)" }}>
      <Container className="!px-0">
        {/* Heading */}
        <h2 style={{
          fontFamily: "'Playfair Display', var(--font-playfair), serif",
          fontSize: "2.2rem",
          fontWeight: 400,
          textAlign: "center",
          marginBottom: "2.5rem",
          color: "var(--black)",
        }}>
          {title}
        </h2>

        {/* Horizontal scroll carousel */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div
            ref={carouselRef}
            style={{
              display: "flex",
              gap: "1.5rem",
              overflowX: "auto",
              paddingBottom: "1.5rem",
              scrollBehavior: "smooth",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              cursor: "grab",
            }}
            onMouseDown={(e) => {
              const el = carouselRef.current;
              if (!el) return;
              el.style.cursor = "grabbing";
              const startX = e.pageX - el.offsetLeft;
              const scrollLeft = el.scrollLeft;
              const onMove = (ev: MouseEvent) => {
                const x = ev.pageX - el.offsetLeft;
                el.scrollLeft = scrollLeft - (x - startX);
              };
              const onUp = () => {
                el.style.cursor = "grab";
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
              };
              window.addEventListener("mousemove", onMove);
              window.addEventListener("mouseup", onUp);
            }}
          >
            {blogs.map((blog) => (
              <div
                key={blog._id}
                style={{ minWidth: "240px", flexShrink: 0 }}
              >
                <Link href={`/blog/${blog.slug}`} style={{ display: "block", textDecoration: "none" }}>
                  <div style={{ width: "100%", height: "320px", position: "relative", overflow: "hidden", marginBottom: "1rem" }}>
                    <Image
                      src={blog.previewImage || "/placeholder-blog.jpg"}
                      alt={blog.title}
                      fill
                      sizes="240px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </Link>

                <h4 style={{
                  fontFamily: "'Playfair Display', var(--font-playfair), serif",
                  fontSize: "1.3rem",
                  fontWeight: 400,
                  lineHeight: 1.3,
                  marginBottom: "0.75rem",
                  color: "var(--black)",
                }}>
                  {blog.title}
                </h4>

                <Link
                  href={`/blog/${blog.slug}`}
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--gray-600)",
                    textDecoration: "underline",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Read &amp; Shop
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link
            href="/blogs"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "200px",
              padding: "0.75rem 1.75rem",
              fontSize: "0.72rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontWeight: 400,
              background: "transparent",
              color: "var(--black)",
              border: "1px solid var(--black)",
              borderRadius: "2px",
              textDecoration: "none",
              transition: "all 0.3s",
            }}
          >
            Read the Latest Stories
          </Link>
        </div>
      </Container>
    </section>
  );
}
