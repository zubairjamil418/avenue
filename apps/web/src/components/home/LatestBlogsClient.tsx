"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowUpRight } from "lucide-react";
import Container from "../common/Container";
import { Blog } from "./LatestBlogs";

export default function LatestBlogsClient({ blogs }: { blogs: Blog[] }) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="py-10 md:py-14 lg:py-[70px]">
      <Container>
        <div className="flex flex-col gap-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-['Urbanist',sans-serif] text-[32px] font-bold text-light-primary-text leading-[48px]">
              Latest Blogs
            </h2>
            <Link
              href="/blogs"
              className="font-['Urbanist',sans-serif] text-[24px] font-bold text-light-primary-text leading-[36px] hover:text-primary transition-colors"
            >
              View All
            </Link>
          </div>

          {/* Blogs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="flex flex-col group"
              >
                {/* Image — full bleed, no padding, no border */}
                <Link href={`/blog/${blog.slug}`} className="block">
                  <div className="relative h-[260px] w-full rounded-[16px] overflow-hidden">
                    <Image
                      src={blog.previewImage || "/placeholder-blog.jpg"}
                      alt={blog.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>
                </Link>

                {/* Content */}
                <div className="pt-5 flex flex-col items-start grow gap-4">
                  {/* Title */}
                  <Link href={`/blog/${blog.slug}`} className="hover:text-primary transition-colors">
                    <h4 className="font-['Urbanist',sans-serif] text-[22px] font-bold text-light-primary-text hover:text-primary transition-colors leading-[1.3] line-clamp-2">
                      {blog.title}
                    </h4>
                  </Link>

                  {/* Button */}
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="mt-auto inline-flex items-center gap-3 border border-light-primary-text text-light-primary-text font-['DM_Sans',sans-serif] font-semibold text-[13px] tracking-[0.12em] uppercase py-[12px] px-[22px] w-max hover:bg-light-primary-text hover:text-white transition-colors duration-300 group/btn"
                  >
                    Read &amp; Shop
                    <ArrowUpRight className="size-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
