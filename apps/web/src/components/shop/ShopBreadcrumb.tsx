"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ShopBreadcrumbProps {
  category?: string;
}

export default function ShopBreadcrumb({ category }: ShopBreadcrumbProps) {
  const pathname = usePathname();
  const locales = ["en", "de", "fr", "it", "en-SG"];
  const firstSeg = pathname.split("/").filter(Boolean)[0];
  const homeHref = locales.includes(firstSeg) ? `/${firstSeg}` : "/";
  const shopHref = `${homeHref}/shop`;

  const crumbStyle = {
    fontSize: "0.75rem",
    color: "var(--gray-500)",
    textDecoration: "none",
    transition: "color 0.15s",
  };
  const sepStyle = { fontSize: "0.75rem", color: "var(--gray-400)", margin: "0 0.3rem" };

  return (
    <nav style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
      <Link href={homeHref} style={crumbStyle} className="hover:text-black">
        Home
      </Link>
      <span style={sepStyle}>/</span>
      <Link href={shopHref} style={crumbStyle} className="hover:text-black">
        Shop
      </Link>
      {category && (
        <>
          <span style={sepStyle}>/</span>
          <span style={{ ...crumbStyle, color: "var(--black)", fontWeight: 500 }}>
            {category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
        </>
      )}
    </nav>
  );
}
