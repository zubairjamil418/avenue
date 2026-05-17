"use client";
import { usePathname } from "next/navigation";
import HomeSkeleton from "@/components/home/HomeSkeleton";
import Home2Skeleton from "@/components/home/beauty/Home2Skeleton";

/**
 * [homeSlug]/loading.tsx
 * Shows while home-2, beauty, or other home variants load server-side data.
 */
export default function Loading() {
  const pathname = usePathname();
  if (pathname?.includes("home-2")) {
    return <Home2Skeleton />;
  }
  return <HomeSkeleton />;
}
