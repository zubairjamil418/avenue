"use client";
import { Link } from "@/i18n/routing";
import {
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Container from "../Container";
import { useMenus } from "@/hooks/useMenus";
import { NavItem } from "@/constants/data";

interface BottomHeaderProps {
  initialMenus?: NavItem[];
}

const BottomHeader = ({ initialMenus }: BottomHeaderProps) => {
  const { menus, isLoading: menusLoading } = useMenus(initialMenus);

  return (
    <div
      className="hidden xl:flex header-bottom z-50"
      style={{ background: "var(--gray-200)", paddingBottom: "0.5rem" }}
    >
      <Container className="flex items-center w-full !px-[var(--site-gutter)]">
          {/* Main Navigation */}
          <nav className="main-menu w-full">
            <ul className="flex items-center justify-start w-full">
              {menusLoading ? (
                // Simple skeleton or loading state
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-4 w-20 bg-gray-200 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                menus.map((item) => (
                  <li
                    key={item._id || item.id}
                    className={
                      (item.subItems && item.subItems.length > 0) || item.isMega
                        ? "has-sub-item"
                        : ""
                    }
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-1 whitespace-nowrap"
                    >
                      {item.title}
                      {((item.subItems && item.subItems.length > 0) ||
                        item.isMega) && <ChevronDown className="size-4" />}
                    </Link>

                    {/* Standard Sub-menu */}
                    {item.subItems &&
                      item.subItems.length > 0 &&
                      !item.isMega && (
                        <ul>
                          {item.subItems.map((subItem) => (
                            <li
                              key={subItem._id || subItem.id}
                              className={
                                subItem.subItems && subItem.subItems.length > 0
                                  ? "has-sub-item"
                                  : ""
                              }
                            >
                              <Link
                                href={subItem.href}
                                className={`text-[0.78rem] text-black hover:text-primary transition-colors ${
                                  subItem.subItems &&
                                  subItem.subItems.length > 0
                                    ? "flex items-center justify-between w-full"
                                    : ""
                                }`}
                              >
                                {subItem.title}
                                {subItem.subItems &&
                                  subItem.subItems.length > 0 && (
                                    <ChevronRight className="size-4" />
                                  )}
                              </Link>
                              {subItem.subItems &&
                                subItem.subItems.length > 0 && (
                                  <ul>
                                    {subItem.subItems.map((thirdItem) => (
                                      <li key={thirdItem._id || thirdItem.id}>
                                        <Link
                                          href={thirdItem.href}
                                          className="text-[0.78rem] text-black hover:text-primary transition-colors block w-full"
                                        >
                                          {thirdItem.title}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                            </li>
                          ))}
                        </ul>
                      )}

                    {/* Mega Menu */}
                    {item.isMega && item.megaData && (
                      <div className="mega-menu">
                        <div className="w-full max-w-screen-2xl mx-auto" style={{ paddingTop: "2.5rem", paddingBottom: "2.5rem", paddingLeft: "var(--site-gutter)", paddingRight: "var(--site-gutter)" }}>
                          <div style={{ display: "flex", gap: "4rem", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "flex-start" }}>
                            {item.megaData.map((column, colIdx) => (
                              <div
                                key={column._id || column.id || colIdx}
                                style={{ minWidth: "140px" }}
                              >
                                <span className="text-[0.8rem] leading-[22px] font-bold text-black mb-3 block">
                                  {column.title}
                                </span>
                                <ul style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                  {column.items.map((subLink, subIdx) => {
                                    const isHeading = !subLink.href || subLink.href.trim() === "";
                                    const formattedHref = isHeading ? "#" : subLink.href;
                                    return (
                                      <li
                                        key={subLink._id || subLink.id || subIdx}
                                        style={isHeading ? { marginTop: "1rem" } : {}}
                                      >
                                        {isHeading ? (
                                          <span className="text-[0.8rem] font-bold text-black block">
                                            {subLink.title}
                                          </span>
                                        ) : (
                                          <Link
                                            href={formattedHref}
                                            className="text-[0.78rem] text-black hover:text-primary transition-colors block"
                                          >
                                            {subLink.title}
                                          </Link>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
          </nav>


      </Container>
    </div>
  );
};

export default BottomHeader;
