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

export default async function ShopFavoriteCategories() {
  const categories = await getFavoriteCategories();

  if (categories.length === 0) return null;

  return (
    <section className="py-10 md:py-14">
      <Container>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/shop?category=${category.slug}`}
              className="group flex flex-col gap-3"
            >
              {/* Image */}
              <div className="w-full aspect-[3/4] overflow-hidden bg-gray-100 border border-gray-200">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400 text-4xl font-bold">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Label */}
              <span className="text-[11px] sm:text-[12px] font-semibold tracking-[0.15em] uppercase text-light-primary-text underline underline-offset-4 group-hover:text-gray-500 transition-colors duration-200">
                Shop {category.name}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
