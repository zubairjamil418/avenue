import { Link } from "@/i18n/routing";
import Container from "../common/Container";
import type { WebsiteConfig } from "@/lib/homeDataFetcher";

interface Props {
  config: WebsiteConfig;
}

export default function InStoreSection({ config }: Props) {
  const s = config.settings as Record<string, unknown>;
  const image = (s?.images as string[] | undefined)?.[0] || (s?.adImageUrl as string | undefined);
  const sectionTitle = config.title || "There's More In-Store";
  const cardTitle = (s?.["Sub Title"] as string | undefined) || sectionTitle;
  const description = config.description;
  const linkHref = ((s?.["Link "] || s?.["Link"] || s?.adLink) as string | undefined) || "/contact";
  const findOutHref = linkHref;
  const visitHref = linkHref;

  return (
    <section style={{ padding: "4rem var(--site-gutter) 6rem" }}>
      <Container>
        {/* Heading */}
        <h2 style={{
          fontFamily: "'Playfair Display', var(--font-playfair), serif",
          fontSize: "2.2rem",
          fontWeight: 400,
          textAlign: "center",
          marginBottom: "2.5rem",
          color: "var(--black)",
        }}>
          {sectionTitle}
        </h2>

        {/* 2-col grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          gap: "4rem",
        }}>
          {/* Left: image */}
          {image ? (
            <img
              src={image}
              alt={sectionTitle}
              style={{ width: "100%", height: "340px", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div style={{ width: "100%", height: "340px", background: "var(--gray-100)" }} />
          )}

          {/* Right: text */}
          <div style={{ maxWidth: "420px" }}>
            <h3 style={{
              fontFamily: "'Playfair Display', var(--font-playfair), serif",
              fontSize: "1.8rem",
              fontWeight: 400,
              color: "var(--brand-black)",
              marginBottom: "1rem",
              lineHeight: 1.2,
            }}>
              {cardTitle}
            </h3>

            {description && (
              <p style={{
                fontSize: "0.9rem",
                color: "var(--gray-600)",
                lineHeight: 1.6,
                marginBottom: "1.5rem",
              }}>
                {description}
              </p>
            )}

            <Link
              href={findOutHref as "/contact"}
              style={{
                fontSize: "0.8rem",
                textDecoration: "underline",
                color: "var(--brand-black)",
              }}
            >
              Find Out More
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <Link
            href={visitHref as "/contact"}
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
            Plan Your Visit
          </Link>
        </div>
      </Container>
    </section>
  );
}
