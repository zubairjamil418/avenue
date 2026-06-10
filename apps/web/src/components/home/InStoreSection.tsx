import { Link } from "@/i18n/routing";
import Container from "../common/Container";
import type { WebsiteConfig } from "@/lib/homeDataFetcher";

interface Props {
  config: WebsiteConfig;
}

export default function InStoreSection({ config }: Props) {
  const s = config.settings as Record<string, unknown>;
  const image = (s?.images as string[] | undefined)?.[0] || (s?.adImageUrl as string | undefined);

  // 1. Custom field — main title shown as top h2
  const mainTitle = (s?.["Title "] as string | undefined) || "";

  // 2 & 3. From component form (not custom fields)
  const sectionTitle = config.title || "";
  const description = config.description || "";

  // 4. Custom field — link below description
  const linkText = (s?.["Link title"] as string | undefined) || "";
  const linkHref = (s?.["Link "] as string | undefined) || (s?.adLink as string | undefined) || "/contact";

  // 5. Custom field — bottom CTA button
  const buttonLabel = (s?.["Button Title"] as string | undefined) || "";
  const buttonHref = (s?.["Button Url"] as string | undefined) || linkHref;

  return (
    <section style={{ padding: "4rem var(--site-gutter) 6rem" }}>
      <Container>

        {/* 1. Main Title — custom field */}
        {mainTitle && (
          <h2 style={{
            fontFamily: "'Playfair Display', var(--font-playfair), serif",
            fontSize: "2.2rem",
            fontWeight: 400,
            textAlign: "center",
            marginBottom: "2.5rem",
            color: "var(--black)",
          }}>
            {mainTitle}
          </h2>
        )}

        {/* 2-col grid: image + text */}
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ alignItems: "center", gap: "3rem" }}>

          {/* Image */}
          {image ? (
            <img
              src={image}
              alt={mainTitle || sectionTitle}
              style={{ width: "100%", height: "340px", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div style={{ width: "100%", height: "340px", background: "var(--gray-100)" }} />
          )}

          {/* Text column */}
          <div style={{ maxWidth: "420px" }}>

            {/* 2. Section Title — from component form */}
            {sectionTitle && (
              <h3 style={{
                fontFamily: "'Playfair Display', var(--font-playfair), serif",
                fontSize: "1.8rem",
                fontWeight: 400,
                color: "var(--black)",
                marginBottom: "1rem",
                lineHeight: 1.25,
              }}>
                {sectionTitle}
              </h3>
            )}

            {/* 3. Description — from component form */}
            {description && (
              <p style={{
                fontSize: "0.9rem",
                color: "var(--gray-600)",
                lineHeight: 1.7,
                marginBottom: "1.25rem",
              }}>
                {description}
              </p>
            )}

            {/* 4. Link — custom field */}
            {linkText && (
              <Link
                href={linkHref as "/contact"}
                style={{
                  fontSize: "0.85rem",
                  textDecoration: "underline",
                  color: "var(--black)",
                  display: "inline-block",
                }}
              >
                {linkText}
              </Link>
            )}
          </div>
        </div>

        {/* 5. CTA Button — custom field */}
        {buttonLabel && (
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link
              href={buttonHref as "/contact"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--black)",
                color: "#ffffff",
                padding: "0.8rem 2.5rem",
                fontSize: "0.8rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                fontWeight: 400,
                borderRadius: 0,
                textDecoration: "none",
                border: "none",
              }}
            >
              {buttonLabel}
            </Link>
          </div>
        )}

      </Container>
    </section>
  );
}
