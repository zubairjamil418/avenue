"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaginationBar({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationBarProps) {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    // If total pages is small, show all
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logic for larger page counts
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  const btnBase: React.CSSProperties = {
    width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
    border: "1px solid var(--gray-300)", background: "none", fontSize: "0.8rem",
    cursor: "pointer", color: "var(--black)",
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "3rem" }}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={{ ...btnBase, opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPageNumbers().map((page, index) => {
        if (page === "...") {
          return <span key={`e-${index}`} style={{ ...btnBase, border: "none" }}>…</span>;
        }
        const isCurrent = page === currentPage;
        return (
          <button
            key={`p-${page}`}
            onClick={() => onPageChange(page as number)}
            style={{
              ...btnBase,
              background: isCurrent ? "var(--black)" : "none",
              color: isCurrent ? "#fff" : "var(--black)",
              borderColor: isCurrent ? "var(--black)" : "var(--gray-300)",
            }}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={{ ...btnBase, opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
