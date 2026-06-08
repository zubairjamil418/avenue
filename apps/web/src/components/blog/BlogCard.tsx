import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";

interface BlogCardProps {
  post: any;
  view?: "grid" | "list";
  reverse?: boolean;
}

const BlogCard = ({ post, view = "grid", reverse = false }: BlogCardProps) => {
  if (view === "list") {
    const image = (
      <div className="shrink-0 w-full md:w-[38%]" style={{ aspectRatio: "3/2", position: "relative", minHeight: "200px" }}>
        <Link href={`/blog/${post.slug}`} className="absolute inset-0 block">
          <Image src={post.image || "/placeholder-blog.jpg"} alt={post.title} fill className="object-cover" />
        </Link>
      </div>
    );
    const content = (
      <div className="flex flex-col justify-center" style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--gray-500)", marginBottom: "0.75rem" }}>
          {post.category || "Uncategorized"}
        </p>
        <h3 style={{ fontFamily: "'Playfair Display', var(--font-playfair), serif", fontSize: "clamp(1.3rem, 2.2vw, 1.9rem)", fontWeight: 400, color: "#000", marginBottom: "1rem", lineHeight: 1.25 }}>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        {post.excerpt && (
          <p style={{ fontSize: "0.9rem", color: "var(--gray-600)", lineHeight: 1.75, marginBottom: "1.25rem" }}>
            {post.excerpt}
          </p>
        )}
        <Link href={`/blog/${post.slug}`} style={{ fontSize: "0.85rem", color: "#000", textDecoration: "underline", marginBottom: "0.6rem", display: "inline-block" }}>
          Read &amp; Shop
        </Link>
        <p style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>
          {post.date}{post.author?.name ? ` · ${post.author.name}` : ""}
        </p>
      </div>
    );
    return (
      <div
        className="flex flex-col md:flex-row w-full md:items-center"
        style={{ borderBottom: "1px solid var(--gray-200)", paddingBottom: "3rem", marginBottom: "3rem", gap: "2.5rem" }}
      >
        {image}
        {content}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div style={{ position: "relative", width: "100%", aspectRatio: "3/2", overflow: "hidden", marginBottom: "1.25rem" }}>
        <Link href={`/blog/${post.slug}`} className="absolute inset-0 block">
          <Image src={post.image || "/placeholder-blog.jpg"} alt={post.title} fill className="object-cover" />
        </Link>
      </div>
      <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--gray-500)", marginBottom: "0.5rem" }}>
        {post.category || "Uncategorized"}
      </p>
      <h3 style={{ fontFamily: "'Playfair Display', var(--font-playfair), serif", fontSize: "1.2rem", fontWeight: 400, color: "#000", marginBottom: "0.6rem", lineHeight: 1.3 }}>
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h3>
      {post.excerpt && (
        <p style={{ fontSize: "0.85rem", color: "var(--gray-500)", lineHeight: 1.6, marginBottom: "0.75rem" }}>
          {post.excerpt}
        </p>
      )}
      <Link href={`/blog/${post.slug}`} style={{ fontSize: "0.8rem", color: "#000", textDecoration: "underline", marginBottom: "0.5rem" }}>
        Read &amp; Shop
      </Link>
      <p style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>
        {post.date}{post.author?.name ? ` · ${post.author.name}` : ""}
      </p>
    </div>
  );
};

export default BlogCard;
