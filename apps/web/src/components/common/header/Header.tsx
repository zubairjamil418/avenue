"use client";
import BottomHeader from "./BottomHeader";
import MiddleHeader from "./MiddleHeader";
import TopHeader from "./TopHeader";
import ResponsiveHeaderMenu from "./ResponsiveHeaderMenu";
import { CategoryTreeNode } from "@/hooks/useCategoryTree";
import { NavItem } from "@/constants/data";

interface HeaderProps {
  initialMenus?: NavItem[];
  initialCategoryTree?: CategoryTreeNode[];
  logoUrl?: string;
}

export default function Header({ initialMenus, initialCategoryTree, logoUrl }: HeaderProps) {
  return (
    <>
      <header
        style={{
          position: "relative",
          background: "var(--gray-200)",
          color: "var(--black)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        <TopHeader />
        <MiddleHeader logoUrl={logoUrl} />
        <BottomHeader initialMenus={initialMenus} />

        {/* Mobile Menu */}
        <ResponsiveHeaderMenu
          initialMenus={initialMenus}
          initialCategoryTree={initialCategoryTree}
          logoUrl={logoUrl}
        />
      </header>
    </>
  );
}
