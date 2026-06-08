"use client";

import React, { useState } from "react";
import { Grid3x3, List, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import BlogCard from "@/components/blog/BlogCard";

type Category = { _id: string; name: string };
type BlogAuthor = { _id: string; name: string; image: string };

type RealBlog = {
  _id: string;
  slug: string;
  title: string;
  previewImage: string;
  category: Category;
  author: BlogAuthor;
  publishedAt: string;
  createdAt: string;
  excerpt?: string;
};

interface BlogsClientProps {
  initialBlogs: RealBlog[];
}

const POSTS_PER_PAGE = 9;

function toPlainExcerpt(text: string, maxChars = 220): string {
  const stripped = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return stripped.length > maxChars ? stripped.slice(0, maxChars).replace(/\s\S*$/, "") + "…" : stripped;
}

const BlogsClient = ({ initialBlogs }: BlogsClientProps) => {
  const [view, setView] = useState<"grid" | "list">("list");
  const [blogs] = useState<RealBlog[]>(initialBlogs);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");

  const filtered = blogs
    .filter((b) => b.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "latest") return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
      if (sort === "oldest") return new Date(a.publishedAt || a.createdAt).getTime() - new Date(b.publishedAt || b.createdAt).getTime();
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <div style={{ paddingTop: "2.5rem" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--gray-200)", paddingBottom: "1rem", marginBottom: "3rem", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button onClick={() => setView("grid")} style={{ color: view === "grid" ? "#000" : "var(--gray-400)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <Grid3x3 size={18} />
          </button>
          <button onClick={() => setView("list")} style={{ color: view === "list" ? "#000" : "var(--gray-400)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <List size={18} />
          </button>
          <span style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>
            Showing {Math.min((page - 1) * POSTS_PER_PAGE + 1, filtered.length)}–{Math.min(page * POSTS_PER_PAGE, filtered.length)} of {filtered.length} results
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <input
            type="text"
            placeholder="Search articles"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ border: "1px solid var(--gray-300)", borderRadius: 0, padding: "0.5rem 1rem", fontSize: "0.85rem", outline: "none", width: "200px" }}
            onFocus={e => e.currentTarget.style.borderColor = "#000"}
            onBlur={e => e.currentTarget.style.borderColor = "var(--gray-300)"}
          />
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            style={{ border: "1px solid var(--gray-300)", borderRadius: 0, padding: "0.5rem 1rem", fontSize: "0.85rem", outline: "none", background: "#fff", cursor: "pointer" }}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* Grid / List */}
      {paginated.length > 0 ? (
        view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: "3rem 2rem", marginBottom: "4rem" }}>
            {paginated.map((post) => (
              <BlogCard
                key={post._id}
                view="grid"
                post={{
                  id: post._id,
                  title: post.title,
                  slug: post.slug,
                  category: post.category?.name || "Uncategorized",
                  date: new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
                  excerpt: post.excerpt ? toPlainExcerpt(post.excerpt) : "So you have heard about this site or you have been to it, but you cannot figure out.",
                  image: post.previewImage,
                  author: { name: post.author?.name || "", avatar: post.author?.image || "" },
                }}
              />
            ))}
          </div>
        ) : (
          <div style={{ marginBottom: "4rem" }}>
            {paginated.map((post) => (
              <BlogCard
                key={post._id}
                view="list"
                post={{
                  id: post._id,
                  title: post.title,
                  slug: post.slug,
                  category: post.category?.name || "Uncategorized",
                  date: new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
                  excerpt: post.excerpt ? toPlainExcerpt(post.excerpt) : "So you have heard about this site or you have been to it, but you cannot figure out.",
                  image: post.previewImage,
                  author: { name: post.author?.name || "", avatar: post.author?.image || "" },
                }}
              />
            ))}
          </div>
        )
      ) : (
        <p style={{ textAlign: "center", color: "var(--gray-500)", padding: "5rem 0", fontSize: "0.9rem" }}>No articles found.</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ width: "36px", height: "36px", border: "1px solid var(--gray-300)", background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === 1 ? 0.4 : 1 }}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{ width: "36px", height: "36px", border: `1px solid ${p === page ? "#000" : "var(--gray-300)"}`, background: p === page ? "#000" : "#fff", color: p === page ? "#fff" : "var(--gray-700)", fontSize: "0.85rem", cursor: "pointer", fontWeight: p === page ? 500 : 400 }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ width: "36px", height: "36px", border: "1px solid var(--gray-300)", background: "#fff", cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === totalPages ? 0.4 : 1 }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogsClient;
