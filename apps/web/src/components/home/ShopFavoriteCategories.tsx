import { Link } from "@/i18n/routing";
import Container from "../common/Container";
import api from "@/lib/api";
import { CATEGORY_ENDPOINTS } from "@/constants/endpoints";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  isFavorite?: boolean;
}

async function getFavoriteCategories(): Promise<Category[]> {
  try {
    const res = await api.get<{ categories: Category[] }>(
      `${CATEGORY_ENDPOINTS.BASE}?perPage=100`,
      { next: { revalidate: 600 } },
    );
    const all: Category[] = res.data.categories || [];
    return all.filter((c) => c.isFavorite === true).slice(0, 5);
  } catch {
    return [];
  }
}

export default async function ShopFavoriteCategories({ title = "What's Trending" }: { title?: string }) {
  const categories = await getFavoriteCategories();

  if (categories.length === 0) return null;

  return (
    <section style={{ padding: "4rem var(--site-gutter)" }}>
      <Container className="!px-0">
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem" }}>
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/shop?category=${category.slug}`}
              style={{ display: "flex", flexDirection: "column", gap: "0.75rem", textDecoration: "none" }}
            >
              <div style={{
                background: "var(--gray-100)",
                padding: "1rem",
                aspectRatio: "3/4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}>
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ color: "var(--gray-400)", fontSize: "2rem", fontWeight: 700 }}>
                    {category.name.charAt(0)}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--black)",
                textDecoration: "underline",
              }}>
                Shop {category.name}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
