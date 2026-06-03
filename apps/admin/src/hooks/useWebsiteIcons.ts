import { useState, useEffect } from "react";
import api from "@/lib/api";

interface WebsiteIcon {
  _id: string;
  key: string;
  category: string;
  imageUrl: string;
  isActive: boolean;
}

interface UseWebsiteIconsResult {
  mainLogo: string | null;
  favicon: string | null;
  isLoading: boolean;
}

let cachedIcons: WebsiteIcon[] | null = null;

export function useWebsiteIcons(): UseWebsiteIconsResult {
  const [icons, setIcons] = useState<WebsiteIcon[]>(cachedIcons ?? []);
  const [isLoading, setIsLoading] = useState(!cachedIcons);

  useEffect(() => {
    if (cachedIcons) return;
    api
      .get("/website-icons?isActive=true")
      .then((res) => {
        const data: WebsiteIcon[] = res.data?.data ?? res.data ?? [];
        cachedIcons = data;
        setIcons(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const find = (key: string, category: string) =>
    icons.find((i) => i.key === key || i.category === category)?.imageUrl ?? null;

  return {
    mainLogo: find("main_logo", "header"),
    favicon: find("favicon", "favicon"),
    isLoading,
  };
}
