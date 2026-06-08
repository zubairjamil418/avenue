import React from "react";
import Container from "@/components/common/Container";
import Breadcrumb from "@/components/product/Breadcrumb";
import Image from "next/image";
import {
  Calendar,
  Eye,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import BlogComments from "@/components/blog/BlogComments";
import RelatedArticles from "@/components/blog/RelatedArticles";
import CommentSidebarTrigger from "@/components/blog/CommentSidebarTrigger";
import CommentSidebar from "@/components/blog/CommentSidebar";
import type { Metadata } from "next";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return {
    title: "Blog Details"
  };
}


type RealBlog = {
  _id: string;
  slug: string;
  title: string;
  previewImage: string;
  bannerImage?: string;
  content: string;
  excerpt?: string;
  category: { _id: string; name: string };
  author: { _id: string; name: string; image?: string };
  tags?: string[];
  views?: number;
  publishedAt: string;
  createdAt: string;
};

const SingleBlogPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  let post: RealBlog | null = null;
  let relatedPosts: RealBlog[] = [];

  try {
    const res = await fetch(
      `${(typeof window === "undefined" ? "http://127.0.0.1:8000" : process.env.NEXT_PUBLIC_API_URL) || "http://localhost:8000"}/api/blogs/${slug}`,
      { next: { revalidate: 60 } },
    );
    if (res.ok) {
      post = await res.json();

      // Fetch related blogs from the same category
      if (post?.category?._id) {
        const relatedRes = await fetch(
          `${(typeof window === "undefined" ? "http://127.0.0.1:8000" : process.env.NEXT_PUBLIC_API_URL) || "http://localhost:8000"}/api/blogs?category=${post.category._id}&limit=4`,
          { next: { revalidate: 60 } },
        );
        if (relatedRes.ok) {
          const data = await relatedRes.json();
          // Filter out the current post
          relatedPosts =
            data.blogs?.filter((b: RealBlog) => b._id !== post?._id) || [];
        }
      }
    }
  } catch (error) {
    console.error("Error fetching blog", error);
  }

  if (!post) {
    return (
      <main className="bg-white min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-light-primary-text">
            Blog Post Not Found
          </h1>
          <p className="text-light-secondary-text">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Breadcrumb />

      <section style={{ paddingBottom: "5rem" }}>
        <Container>
          {/* Hero image — full width, no border-radius */}
          <div style={{ position: "relative", width: "100%", aspectRatio: "21/9", overflow: "hidden" }}>
            <Image
              src={post.bannerImage || post.previewImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Article header */}
          <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2.5rem 0 1.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--gray-500)", marginBottom: "1rem" }}>
              {post.category?.name || "Uncategorized"}
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', var(--font-playfair), serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, color: "#000", lineHeight: 1.2, marginBottom: "1.5rem" }}>
              {post.title}
            </h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem", fontSize: "0.8rem", color: "var(--gray-500)", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Calendar className="size-4" />
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              <CommentSidebarTrigger />
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Eye className="size-4" />
                {post.views || 0} views
              </span>
            </div>
          </div>

          {/* Article body */}
          <div style={{ maxWidth: "900px", margin: "0 auto", paddingTop: "1rem" }}>
            {/* Words by author */}
            {post.author?.name && (
              <p style={{ fontSize: "0.85rem", color: "var(--gray-600)", marginBottom: "2rem", borderTop: "1px solid var(--gray-200)", paddingTop: "1.5rem" }}>
                Words by <strong>{post.author.name}</strong>
              </p>
            )}

            {/* Rich text content */}
            <div
              className="
                break-words overflow-hidden
                [&_p]:mb-6 [&_p]:text-base [&_p]:leading-[1.8] [&_p]:text-[#333]
                [&_h1]:font-normal [&_h1]:mt-10 [&_h1]:mb-6 [&_h1]:text-black
                [&_h2]:font-normal [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:text-center [&_h2]:text-black
                [&_h3]:font-normal [&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:text-black
                [&_img]:w-full [&_img]:object-cover [&_img]:my-10
                [&_blockquote]:border-l-[3px] [&_blockquote]:border-black [&_blockquote]:pl-6 [&_blockquote]:my-10 [&_blockquote]:italic [&_blockquote]:text-[var(--gray-600)]
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-6 [&_ul]:text-[#333]
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-6 [&_ol]:text-[#333]
                [&_a]:text-black [&_a]:underline [&_a]:hover:text-[var(--brand-orange)]
                [&_pre]:bg-[var(--gray-50)] [&_pre]:p-4 [&_pre]:overflow-x-auto
                [&_code]:bg-[var(--gray-50)] [&_code]:px-1
              "
              style={{
                fontFamily: "var(--font-poppins), sans-serif",
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            {/* Tags & Share */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", borderTop: "1px solid var(--gray-200)", paddingTop: "1.5rem", marginTop: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#000" }}>Tags:</span>
                {post.tags && post.tags.length > 0 ? (
                  post.tags.map((tag: string) => (
                    <span key={tag} style={{ padding: "0.25rem 0.75rem", border: "1px solid var(--gray-300)", fontSize: "0.75rem", color: "#000", cursor: "pointer" }}>
                      {tag}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>No tags</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#000" }}>Share:</span>
                {[
                  { name: "facebook", Icon: Facebook },
                  { name: "twitter", Icon: Twitter },
                  { name: "instagram", Icon: Instagram },
                  { name: "linkedin", Icon: Linkedin },
                ].map(({ name, Icon }) => (
                  <button key={name} aria-label={`Share on ${name}`}
                    style={{ color: "var(--gray-500)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
                    className="hover:text-black transition-colors">
                    <Icon className="size-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <BlogComments blogId={post._id} />
          </div>

          {/* Related articles */}
          <div style={{ marginTop: "5rem" }}>
            <RelatedArticles relatedPosts={relatedPosts} />
          </div>

          <CommentSidebar blogId={post._id} />
        </Container>
      </section>
    </main>
  );
};

export default SingleBlogPage;
