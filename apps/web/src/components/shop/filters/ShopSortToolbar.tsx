"use client";
import React from "react";
import { List, SlidersHorizontal } from "lucide-react";

export type ViewModeType = "list" | "grid-2" | "grid-3" | "grid-4" | "grid-5";

interface ShopSortToolbarProps {
  totalResults: number;
  currentResultCount: number;
  viewMode: ViewModeType;
  onViewModeChange: (mode: ViewModeType) => void;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  onOpenMobileFilters?: () => void;
  hasLeftFilter?: boolean;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ColumnIcon = ({ cols }: { cols: number }) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {cols === 2 && (
        <>
          <rect x="3" y="3" width="6" height="6" rx="1" />
          <rect x="11" y="3" width="6" height="6" rx="1" />
          <rect x="3" y="11" width="6" height="6" rx="1" />
          <rect x="11" y="11" width="6" height="6" rx="1" />
        </>
      )}
      {cols === 3 && (
        <>
          <rect x="2" y="3" width="4" height="6" rx="0.5" />
          <rect x="8" y="3" width="4" height="6" rx="0.5" />
          <rect x="14" y="3" width="4" height="6" rx="0.5" />
          <rect x="2" y="11" width="4" height="6" rx="0.5" />
          <rect x="8" y="11" width="4" height="6" rx="0.5" />
          <rect x="14" y="11" width="4" height="6" rx="0.5" />
        </>
      )}
      {cols === 4 && (
        <>
          <rect x="1.5" y="3" width="3" height="6" rx="0.5" />
          <rect x="6" y="3" width="3" height="6" rx="0.5" />
          <rect x="10.5" y="3" width="3" height="6" rx="0.5" />
          <rect x="15" y="3" width="3" height="6" rx="0.5" />
          <rect x="1.5" y="11" width="3" height="6" rx="0.5" />
          <rect x="6" y="11" width="3" height="6" rx="0.5" />
          <rect x="10.5" y="11" width="3" height="6" rx="0.5" />
          <rect x="15" y="11" width="3" height="6" rx="0.5" />
        </>
      )}
      {cols === 5 && (
        <>
          <rect x="1" y="3" width="2.4" height="6" rx="0.5" />
          <rect x="4.6" y="3" width="2.4" height="6" rx="0.5" />
          <rect x="8.2" y="3" width="2.4" height="6" rx="0.5" />
          <rect x="11.8" y="3" width="2.4" height="6" rx="0.5" />
          <rect x="15.4" y="3" width="2.4" height="6" rx="0.5" />
          <rect x="1" y="11" width="2.4" height="6" rx="0.5" />
          <rect x="4.6" y="11" width="2.4" height="6" rx="0.5" />
          <rect x="8.2" y="11" width="2.4" height="6" rx="0.5" />
          <rect x="11.8" y="11" width="2.4" height="6" rx="0.5" />
          <rect x="15.4" y="11" width="2.4" height="6" rx="0.5" />
        </>
      )}
    </svg>
  );
};

export default function ShopSortToolbar({
  totalResults,
  currentResultCount,
  viewMode,
  onViewModeChange,
  sortBy = "default",
  onSortChange,
  limit = 25,
  onLimitChange,
  onOpenMobileFilters,
  hasLeftFilter = false,
  isSidebarOpen,
  onToggleSidebar,
}: ShopSortToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3" style={{ marginBottom: "1.5rem" }}>
      {/* Left: sidebar toggle + result count */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {hasLeftFilter && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", background: "none", border: "none", cursor: "pointer", color: "var(--black)", fontWeight: 500 }}
          >
            <SlidersHorizontal size={14} />
            {isSidebarOpen ? "Hide Filters" : "Show Filters"}
          </button>
        )}
        <span style={{ fontSize: "0.85rem", color: "var(--gray-500)" }}>
          Showing {currentResultCount} of {totalResults} products
        </span>
      </div>

      {/* Right: sort select */}
      <select
        value={sortBy}
        onChange={(e) => onSortChange?.(e.target.value)}
        style={{ padding: "0.5rem 1rem", border: "1px solid var(--gray-300)", background: "none", fontSize: "0.8rem", color: "var(--black)", cursor: "pointer", outline: "none" }}
      >
        <option value="default">Newest</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="name">Name: A to Z</option>
      </select>
    </div>
  );
}
