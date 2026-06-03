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
      className="hidden xl:flex header-bottom z-40"
      style={{ background: "var(--gray-200)", paddingBottom: "0.5rem" }}
    >
      <Container className="flex items-center w-full">
          {/* Main Navigation */}
          <nav className="main-menu w-full">
            <ul className="flex items-center justify-center w-full">
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
                                className={`text-black hover:text-primary transition-colors ${
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
                                          className="text-black hover:text-primary transition-colors block w-full"
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
                        <div className="p-10">
                          <div className="grid grid-cols-6 gap-x-4 divide-x divide-border">
                            {item.megaData.map((column, colIdx) => (
                              <div
                                key={column._id || column.id || colIdx}
                                className={`flex flex-col gap-y-1.5 ${
                                  (colIdx + 1) % 10 === 1
                                    ? "pr-4"
                                    : (colIdx + 1) % 10 === 6
                                      ? "pl-4"
                                      : "px-4"
                                }`}
                              >
                                <h5 className="text-sm leading-[22px] uppercase font-semibold text-black mb-2">
                                  {column.title}
                                </h5>
                                <ul className="flex flex-col gap-y-2">
                                  {column.items.map((subLink, subIdx) => {
                                    const rawHref = subLink.href || "#";
                                    let formattedHref = rawHref;

                                    if (
                                      rawHref !== "#" &&
                                      !rawHref.startsWith("http") &&
                                      !rawHref.startsWith("/menu/")
                                    ) {
                                      const cleanHref = rawHref.startsWith("/")
                                        ? rawHref.slice(1)
                                        : rawHref;
                                      formattedHref = `/menu/${cleanHref}`;
                                    }

                                    return (
                                      <li
                                        key={
                                          subLink._id || subLink.id || subIdx
                                        }
                                      >
                                        <Link
                                          href={formattedHref}
                                          className="text-black hover:text-primary transition-colors inline-block w-full"
                                        >
                                          {subLink.title}
                                        </Link>
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
