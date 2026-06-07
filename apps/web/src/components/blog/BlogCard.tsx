import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";

interface BlogCardProps {
  post: any;
  view?: "grid" | "list";
}

const BlogCard = ({ post, view = "grid" }: BlogCardProps) => {
  if (view === "list") {
    return (
      <div className="flex w-full overflow-hidden" style={{ borderBottom: "1px solid var(--gray-200)", paddingBottom: "2rem", marginBottom: "2rem" }}>
        <div className="shrink-0" style={{ width: "280px", height: "190px", position: "relative" }}>
          <Link href={`/blog/${post.slug}`} className="absolute inset-0 block">
            <Image src={post.image || "/placeholder-blog.jpg"} alt={post.title} fill className="object-cover" />
          </Link>
        </div>
        <div className="flex flex-col justify-center" style={{ paddingLeft: "2rem", flex: 1 }}>
          <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--gray-500)", marginBottom: "0.5rem" }}>
            {post.category || "Uncategorized"}
          </p>
          <h3 style={{ fontFamily: "'Playfair Display', var(--font-playfair), serif", fontSize: "1.3rem", fontWeight: 400, color: "#000", marginBottom: "0.75rem", lineHeight: 1.3 }}>
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h3>
          {post.excerpt && (
            <p style={{ fontSize: "0.85rem", color: "var(--gray-500)", lineHeight: 1.6, marginBottom: "1rem" }}>
              {post.excerpt}
            </p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link href={`/blog/${post.slug}`} style={{ fontSize: "0.8rem", color: "#000", textDecoration: "underline" }}>
              Read &amp; Shop
            </Link>
            <span style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>{post.date}</span>
            {post.author?.name && <span style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>by {post.author.name}</span>}
          </div>
        </div>
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
