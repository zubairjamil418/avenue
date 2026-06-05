"use client";
import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { CATEGORY_ENDPOINTS, PRODUCT_TYPE_ENDPOINTS } from "@/constants/endpoints";
import { FilterState } from "../ShopLayoutEngine";
import { Slider } from "@/components/ui/slider";

interface ShopSidebarFilterProps {
  filters?: FilterState;
  onFilterChange?: (newFilters: Partial<FilterState>) => void;
}

export default function ShopSidebarFilter({
  filters = {},
  onFilterChange,
}: ShopSidebarFilterProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(true);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);

  // Search states
  const [categorySearch, setCategorySearch] = useState("");
  const [typeSearch, setTypeSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  
  // Local state for price range
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.priceMin || 0,
    filters.priceMax || 1000,
  ]);

  useEffect(() => {
    if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
      setPriceRange([filters.priceMin, filters.priceMax]);
    } else {
      setPriceRange([0, 100]); // Default based on Figma design
    }
  }, [filters.priceMin, filters.priceMax]);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get(CATEGORY_ENDPOINTS.TREE);
        if (Array.isArray(res.data)) setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories filters", err);
      } finally {
        setIsLoadingCats(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const res = await api.get(PRODUCT_TYPE_ENDPOINTS.BASE);
        if (Array.isArray(res.data)) setProductTypes(res.data);
      } catch (err) {
        console.error("Failed to fetch product types filters", err);
      } finally {
        setIsLoadingTypes(false);
      }
    };
    fetchProductTypes();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await api.get("/api/brands");
        if (Array.isArray(res.data)) setBrands(res.data);
      } catch (err) {
        console.error("Failed to fetch brands", err);
      } finally {
        setIsLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    if (!onFilterChange) return;
    if (filters.category === categoryId) {
      onFilterChange({ category: undefined }); // toggle off
    } else {
      onFilterChange({ category: categoryId });
    }
  };

  const handleProductTypeToggle = (typeSlug: string) => {
    if (!onFilterChange) return;
    const currentTypes = filters.productTypes || [];
    const newTypes = currentTypes.includes(typeSlug)
      ? currentTypes.filter((s) => s !== typeSlug)
      : [...currentTypes, typeSlug];
    onFilterChange({ productTypes: newTypes });
  };

  const handleBrandToggle = (brandId: string) => {
    if (!onFilterChange) return;
    const currentBrands = filters.brands || [];
    const newBrands = currentBrands.includes(brandId)
      ? currentBrands.filter((id) => id !== brandId)
      : [...currentBrands, brandId];
    onFilterChange({ brands: newBrands });
  };

  const handleRatingSelect = (rating: number) => {
    if (!onFilterChange) return;
    if (filters.rating === rating) {
      onFilterChange({ rating: undefined });
    } else {
      onFilterChange({ rating });
    }
  };

  const handlePriceChangeCommitted = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
    if (onFilterChange) {
      onFilterChange({ priceMin: value[0], priceMax: value[1] });
    }
  };


  const resetFilter = (key: keyof FilterState) => {
     if (onFilterChange) {
        onFilterChange({ [key]: undefined });
     }
  }

  const resetAllFilters = () => {
      if (onFilterChange) {
          onFilterChange({ 
            category: undefined,
            productTypes: undefined,
            priceMin: undefined, 
            priceMax: undefined, 
            brands: undefined, 
            rating: undefined,
            sizes: undefined,
            discount: undefined,
            packSizes: undefined
          });
      }
  }

  const handleSizeToggle = (size: string) => {
    if (!onFilterChange) return;
    const currentSizes = filters.sizes || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter((s) => s !== size)
      : [...currentSizes, size];
    onFilterChange({ sizes: newSizes });
  };

  const handleDiscountToggle = (discount: string) => {
    if (!onFilterChange) return;
    const currentDiscounts = filters.discount || [];
    const newDiscounts = currentDiscounts.includes(discount)
      ? currentDiscounts.filter((d) => d !== discount)
      : [...currentDiscounts, discount];
    onFilterChange({ discount: newDiscounts });
  };

  const handlePackSizeToggle = (packSize: string) => {
    if (!onFilterChange) return;
    const currentPackSizes = filters.packSizes || [];
    const newPackSizes = currentPackSizes.includes(packSize)
      ? currentPackSizes.filter((p) => p !== packSize)
      : [...currentPackSizes, packSize];
    onFilterChange({ packSizes: newPackSizes });
  };

  const [openSections, setOpenSections] = useState<string[]>(["categories"]);
  const toggleSection = (key: string) => {
    setOpenSections(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const AccordionSection = ({
    id, label, children,
  }: { id: string; label: string; children: React.ReactNode }) => {
    const isOpen = openSections.includes(id);
    return (
      <div>
        <button
          onClick={() => toggleSection(id)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", padding: "1rem 0",
            borderBottom: `1px solid var(--gray-300)`,
            background: "none", cursor: "pointer",
            ...(isOpen ? { border: "1px solid var(--black)", padding: "0.75rem 1rem" } : {}),
          }}
        >
          <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 500, color: "var(--black)" }}>
            {label}
          </span>
          <span style={{ fontSize: "1.1rem", lineHeight: 1, color: "var(--black)", fontWeight: 300 }}>
            {isOpen ? "−" : "+"}
          </span>
        </button>
        {isOpen && (
          <div style={{ padding: "1rem 0 0.5rem" }}>
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-white">
      {/* CATEGORIES */}
      <AccordionSection id="categories" label="Categories">
        <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto no-scrollbar">
          {isLoadingCats ? (
            <Loader2 className="animate-spin size-4 text-muted-foreground" />
          ) : categories.filter(c => c.name?.toLowerCase().includes(categorySearch.toLowerCase())).map((cat: any) => (
            <label key={cat.slug || cat._id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.category === (cat.slug || cat._id)}
                onChange={() => handleCategorySelect(cat.slug || cat._id)}
                style={{ accentColor: "var(--black)", width: 14, height: 14 }}
              />
              <span style={{ fontSize: "0.85rem", color: "var(--black)" }}>{cat.name}</span>
            </label>
          ))}
        </div>
      </AccordionSection>

      {/* BRANDS */}
      <AccordionSection id="brands" label="Brands">
        <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto no-scrollbar">
          {isLoadingBrands ? (
            <Loader2 className="animate-spin size-4 text-muted-foreground" />
          ) : brands.filter(b => b.name?.toLowerCase().includes(brandSearch.toLowerCase())).map((brand: any) => {
            const id = brand.slug || brand._id;
            return (
              <label key={id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(filters.brands || []).includes(id)}
                  onChange={() => handleBrandToggle(id)}
                  style={{ accentColor: "var(--black)", width: 14, height: 14 }}
                />
                <span style={{ fontSize: "0.85rem", color: "var(--black)" }}>{brand.name}</span>
              </label>
            );
          })}
        </div>
      </AccordionSection>

      {/* COLOURS */}
      <AccordionSection id="colours" label="Colours">
        <div className="flex flex-col gap-2">
          {[
            { name: "Black",   hex: "#000000" },
            { name: "White",   hex: "#ffffff" },
            { name: "Camel",   hex: "#C19A6B" },
            { name: "Blush",   hex: "#D4A5A5" },
            { name: "Teal",    hex: "#7B9E9E" },
            { name: "Stone",   hex: "#C8B8A2" },
            { name: "Charcoal",hex: "#4A4A4A" },
            { name: "Ivory",   hex: "#E8D5C4" },
          ].map(({ name, hex }) => (
            <label key={hex} className="flex items-center gap-3 cursor-pointer group">
              <div style={{
                width: 18, height: 18, borderRadius: "50%", backgroundColor: hex, flexShrink: 0,
                border: hex === "#ffffff" ? "1px solid var(--gray-300)" : "1px solid transparent",
              }} />
              <span style={{ fontSize: "0.85rem", color: "var(--black)" }}>{name}</span>
            </label>
          ))}
        </div>
      </AccordionSection>

      {/* SIZES */}
      <AccordionSection id="sizes" label="Sizes">
        <div className="flex gap-2 flex-wrap">
          {['XS','S','M','L','XL','XXL'].map((size) => {
            const sel = (filters.sizes || []).includes(size);
            return (
              <button
                key={size}
                onClick={() => handleSizeToggle(size)}
                style={{
                  padding: "0.25rem 0.75rem",
                  fontSize: "0.75rem",
                  border: sel ? "1px solid var(--black)" : "1px solid var(--gray-300)",
                  background: sel ? "var(--black)" : "transparent",
                  color: sel ? "#fff" : "var(--black)",
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                }}
              >
                {size}
              </button>
            );
          })}
        </div>
      </AccordionSection>

      {/* PRICE */}
      <AccordionSection id="price" label="Price">
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="number"
            value={priceRange[0]}
            placeholder="Min"
            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            onBlur={() => handlePriceChangeCommitted(priceRange)}
            style={{ width: "100%", border: "1px solid var(--gray-300)", padding: "0.4rem 0.5rem", fontSize: "0.8rem", outline: "none" }}
          />
          <span style={{ fontSize: "0.8rem", color: "var(--gray-500)", flexShrink: 0 }}>–</span>
          <input
            type="number"
            value={priceRange[1]}
            placeholder="Max"
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            onBlur={() => handlePriceChangeCommitted(priceRange)}
            style={{ width: "100%", border: "1px solid var(--gray-300)", padding: "0.4rem 0.5rem", fontSize: "0.8rem", outline: "none" }}
          />
        </div>
      </AccordionSection>

      {/* PRICE TYPE */}
      <AccordionSection id="price-type" label="Price Type">
        <div className="flex flex-col gap-2">
          {[{ label: "Full Price", value: "full" }, { label: "Sale", value: "0-99" }].map(({ label, value }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="priceType"
                checked={(filters.discount || []).includes(value)}
                onChange={() => handleDiscountToggle(value)}
                style={{ accentColor: "var(--black)", width: 14, height: 14 }}
              />
              <span style={{ fontSize: "0.85rem", color: "var(--black)" }}>{label}</span>
            </label>
          ))}
        </div>
      </AccordionSection>
    </div>
  );
}

