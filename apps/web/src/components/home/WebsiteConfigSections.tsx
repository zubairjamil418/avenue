/**
 * WebsiteConfigSections — Server Component
 *
 * Renders home page sections that are configured via the admin
 * Website Config panel (Admin > Dashboard > Website Config).
 *
 * Add a new case below to support extra componentTypes.
 */
"use server";
import type { WebsiteConfig } from "@/lib/homeDataFetcher";
import LatestBlogs from "@/components/home/LatestBlogs";
import { getLatestBlogs } from "@/lib/homeDataFetcher";
import NewsletterForm from "@/components/home/NewsletterForm";

// ─── blogs section ─────────────────────────────────────────────────────────
async function BlogsSection({
  config,
  locale,
}: {
  config: WebsiteConfig;
  locale: string;
}) {
  const blogs = await getLatestBlogs();
  if (!blogs.length) return null;
  return (
    <LatestBlogs
      locale={locale}
      blogs={blogs}
    />
  );
}

// ─── newsletter section ────────────────────────────────────────────────────
function NewsletterSection({ config }: { config: WebsiteConfig }) {
  const bg = config.settings?.backgroundColor || "#05535c";
  const color = config.settings?.textColor || "#ffffff";
  return (
    <section style={{ backgroundColor: bg, color }}>
      <div className="container mx-auto px-4 py-14 text-center">
        <h2 className="text-2xl font-bold mb-2">{config.title}</h2>
        {config.description && (
          <p className="mb-6 opacity-80">{config.description}</p>
        )}
        <NewsletterForm accentColor={bg} />
      </div>
    </section>
  );
}

// ─── custom-html section ───────────────────────────────────────────────────
function CustomHtmlSection({ config }: { config: WebsiteConfig }) {
  const html = config.settings?.customHtml;
  if (!html) return null;
  return (
    <>
      {config.settings?.customCss && (
        // eslint-disable-next-line react/no-danger
        <style dangerouslySetInnerHTML={{ __html: config.settings.customCss }} />
      )}
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

// ─── main renderer ─────────────────────────────────────────────────────────
export default async function WebsiteConfigSections({
  configs,
  locale,
}: {
  configs: WebsiteConfig[];
  locale: string;
}) {
  if (!configs.length) return null;

  // Only render active configs; sort by weight ascending
  const sorted = [...configs]
    .filter((c) => c.isActive)
    .sort((a, b) => a.weight - b.weight);

  return (
    <>
      {sorted.map((config) => {
        switch (config.componentType) {
          case "blogs":
            return <BlogsSection key={config._id} config={config} locale={locale} />;
          case "newsletter":
            return <NewsletterSection key={config._id} config={config} />;
          case "custom-html":
            return <CustomHtmlSection key={config._id} config={config} />;
          default:
            return null;
        }
      })}
    </>
  );
}
