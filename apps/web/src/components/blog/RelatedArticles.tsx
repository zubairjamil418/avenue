"use client";

import React from "react";
import BlogCard from "./BlogCard";

export type BlogSummary = {
  _id: string;
  slug: string;
  title: string;
  previewImage: string;
  excerpt?: string;
  category: { _id: string; name: string };
  author: { _id: string; name: string };
  publishedAt: string;
  createdAt: string;
  views?: number;
};

const RelatedArticles = ({
  relatedPosts,
}: {
  relatedPosts: BlogSummary[];
}) => {
  if (!relatedPosts || relatedPosts.length === 0) return null;

  return (
    <section style={{ paddingTop: "2rem", borderTop: "1px solid var(--gray-200)" }}>
      <h3 style={{ fontFamily: "'Playfair Display', var(--font-playfair), serif", fontSize: "1.8rem", fontWeight: 400, textAlign: "center", marginBottom: "2.5rem", color: "#000" }}>
        Related Articles
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: "2rem 1.5rem" }}>
        {relatedPosts.map((post) => (
          <BlogCard
            key={`related-${post._id}`}
            post={{
              id: post._id,
              slug: post.slug,
              title: post.title,
              excerpt: post.excerpt || "",
              image: post.previewImage,
              category: post.category?.name || "Uncategorized",
              date: new Date(post.publishedAt || post.createdAt).toLocaleDateString(),
              commentsCount: 0,
              content: "",
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default RelatedArticles;
