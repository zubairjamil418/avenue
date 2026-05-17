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

  return (
    <div className="border border-border border-solid flex flex-col items-start overflow-clip relative rounded-[16px] w-full bg-card">
      {/* Filters Header */}
      <div className="bg-light-bg flex gap-[10px] items-center justify-between px-[24px] py-[16px] shrink-0 w-full">
        <p className="font-Urbanist font-bold leading-[30px] text-light-primary-text text-[20px]">
          Filters
        </p>
        <button 
           onClick={resetAllFilters}
           className="font-dm-sans font-semibold leading-[26px] text-primary text-[16px] hover:opacity-80 transition-opacity"
        >
          Clear All
        </button>
      </div>

      <div className="flex flex-col items-start p-[24px] shrink-0 w-full gap-[32px]">
        {/* Category Section */}
        <div className="flex flex-col gap-[16px] items-start shrink-0 w-full">
          <div className="flex gap-[10px] items-center justify-between shrink-0 w-full">
            <p className="font-Urbanist font-bold leading-[28px] text-light-primary-text text-[18px]">
              Category
            </p>
            <button 
               onClick={() => resetFilter('category')}
               className="font-dm-sans font-normal leading-[24px] text-light-secondary-text text-[16px] text-right underline hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>
          
          <div className="border border-light-border border-solid h-[40px] relative rounded-[80px] shrink-0 w-full flex items-center px-3 bg-card">
             <Search className="w-5 h-5 text-muted-foreground mr-2 shrink-0" />
             <input 
                type="text" 
                placeholder="Search..." 
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full bg-transparent outline-none border-none font-dm-sans text-[16px] text-light-primary-text placeholder:text-muted-foreground"
              />
          </div>

          <div className="flex flex-col gap-[8px] items-start shrink-0 w-full max-h-[280px] overflow-y-auto custom-scrollbar pr-2">
            {isLoadingCats ? (
              <div className="py-4 flex justify-center w-full">
                <Loader2 className="animate-spin size-4 text-muted-foreground" />
              </div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories</p>
            ) : (
                categories
                  .filter((cat) => cat.name?.toLowerCase().includes(categorySearch.toLowerCase()))
                  .map((cat: any) => (
                  <div key={cat.slug || cat._id} className="flex gap-[8px] h-[36px] items-center shrink-0 w-full group cursor-pointer" onClick={() => handleCategorySelect(cat.slug || cat._id)}>
                    <Checkbox
                       checked={filters.category === (cat.slug || cat._id)}
                       onCheckedChange={() => handleCategorySelect(cat.slug || cat._id)}
                       className="rounded-full size-5 border-light-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <p className="flex-1 font-dm-sans font-normal leading-[24px] text-light-primary-text text-[16px] group-hover:text-primary transition-colors">
                      {cat.name}
                    </p>
                    <p className="font-dm-sans font-normal leading-[24px] shrink-0 text-light-secondary-text text-[16px]">
                      ( {cat.productCount || 0} )
                    </p>
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="h-px w-full bg-light-divider shrink-0" />

        {/* Product Type Section */}
        <div className="flex flex-col gap-[16px] items-start shrink-0 w-full">
          <div className="flex gap-[10px] items-center justify-between shrink-0 w-full">
            <p className="font-Urbanist font-bold leading-[28px] text-light-primary-text text-[18px]">
              Product Type
            </p>
            <button 
               onClick={() => resetFilter('productTypes')}
               className="font-dm-sans font-normal leading-[24px] text-light-secondary-text text-[16px] text-right underline hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>
          
          <div className="border border-light-border border-solid h-[40px] relative rounded-[80px] shrink-0 w-full flex items-center px-3 bg-card">
             <Search className="w-5 h-5 text-muted-foreground mr-2 shrink-0" />
             <input 
                type="text" 
                placeholder="Search types..." 
                value={typeSearch}
                onChange={(e) => setTypeSearch(e.target.value)}
                className="w-full bg-transparent outline-none border-none font-dm-sans text-[16px] text-light-primary-text placeholder:text-muted-foreground"
              />
          </div>

          <div className="flex flex-col gap-[8px] items-start shrink-0 w-full max-h-[280px] overflow-y-auto custom-scrollbar pr-2">
            {isLoadingTypes ? (
              <div className="py-4 flex justify-center w-full">
                <Loader2 className="animate-spin size-4 text-muted-foreground" />
              </div>
            ) : productTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No product types</p>
            ) : (
                productTypes
                  .filter((pt) => (pt.title || pt.name || "").toLowerCase().includes(typeSearch.toLowerCase()))
                  .map((pt: any) => {
                    const identifier = pt.slug || pt._id;
                    const checked = (filters.productTypes || []).includes(identifier);
                    return (
                      <div key={identifier} className="flex gap-[8px] h-[36px] items-center shrink-0 w-full group cursor-pointer" onClick={() => handleProductTypeToggle(identifier)}>
                        <Checkbox
                           checked={checked}
                           onCheckedChange={() => handleProductTypeToggle(identifier)}
                           className="rounded-full size-5 border-light-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <p className="flex-1 font-dm-sans font-normal leading-[24px] text-light-primary-text text-[16px] group-hover:text-primary transition-colors">
                          {pt.title || pt.name}
                        </p>
                      </div>
                    )
                  })
            )}
          </div>
        </div>

        <div className="h-px w-full bg-light-divider shrink-0" />

        {/* Price Range Section */}
        <div className="flex flex-col gap-[24px] items-start shrink-0 w-full">
          <div className="flex gap-[10px] items-center justify-between shrink-0 w-full">
            <p className="font-Urbanist font-bold leading-[28px] text-light-primary-text text-[18px]">
              Price Range
            </p>
            <button 
                onClick={() => { resetFilter('priceMin'); resetFilter('priceMax'); }}
                className="font-dm-sans font-normal leading-[24px] text-light-secondary-text text-[16px] text-right underline hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>
          
          <div className="px-2 w-full mt-2">
            <Slider
               defaultValue={[0, 100]}
               max={500}
               step={1}
               value={priceRange}
               onValueChange={(val) => setPriceRange([val[0], val[1]])}
               onValueCommit={handlePriceChangeCommitted}
               className="w-full"
            />
          </div>

          <div className="flex gap-[16px] items-center shrink-0 w-full">
            <div className="border border-light-border border-solid flex-1 h-[40px] relative rounded-[80px] flex items-center px-[12px] min-w-0 pr-0">
              <span className="font-dm-sans text-light-primary-text text-[14px] shrink-0 mr-1">$</span>
               <input 
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => {
                     const val = Number(e.target.value);
                     setPriceRange([val, priceRange[1]]);
                  }}
                  onBlur={() => handlePriceChangeCommitted(priceRange)}
                  className="w-0 min-w-0 flex-1 bg-transparent outline-none border-none font-dm-sans text-[14px] text-light-primary-text appearance-none pr-2"
               />
            </div>
            <p className="font-dm-sans font-medium leading-[22px] shrink-0 text-muted-foreground text-[14px]">
              To
            </p>
            <div className="border border-light-border border-solid flex-1 h-[40px] relative rounded-[80px] flex items-center px-[12px] min-w-0 pr-0">
               <span className="font-dm-sans text-light-primary-text text-[14px] shrink-0 mr-1">$</span>
               <input 
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => {
                     const val = Number(e.target.value);
                     setPriceRange([priceRange[0], val]);
                  }}
                  onBlur={() => handlePriceChangeCommitted(priceRange)}
                 className="w-0 min-w-0 flex-1 bg-transparent outline-none border-none font-dm-sans text-[14px] text-light-primary-text appearance-none pr-2"
               />
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-light-divider shrink-0" />

        {/* Rating Section */}
        <div className="flex flex-col gap-[16px] items-start shrink-0 w-full">
          <div className="flex gap-[10px] items-center justify-between shrink-0 w-full">
            <p className="font-Urbanist font-bold leading-[28px] text-light-primary-text text-[18px]">
              Rating
            </p>
            <button 
               onClick={() => resetFilter('rating')}
               className="font-dm-sans font-normal leading-[24px] text-light-secondary-text text-[16px] text-right underline hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>
          <div className="flex gap-[12px] items-start shrink-0 w-full flex-wrap pb-2">
             {[5, 4, 3, 2, 1].map((rating) => (
                <button
                   key={rating}
                   onClick={() => handleRatingSelect(rating)}
                   className={`border border-solid gap-[6px] h-[36px] items-center py-[6px] rounded-[80px] flex px-[16px] transition-colors ${
                      filters.rating === rating 
                        ? "border-primary bg-primary/5 text-primary" 
                        : "border-light-border hover:border-primary hover:bg-primary/5 text-light-primary-text"
                   }`}
                >
                   <span className="font-dm-sans font-semibold text-[16px] leading-[24px]">{rating}</span>
                   <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-warning fill-warning">
                       <path d="M10 14.5L4.12 18L5.64 11.2L0.420002 6.55L7.42 5.93L10 0L12.58 5.93L19.58 6.55L14.36 11.2L15.88 18L10 14.5Z" />
                   </svg>
                </button>
             ))}
          </div>
        </div>

        <div className="h-px w-full bg-light-divider shrink-0" />

        {/* Brands Section */}
        <div className="flex flex-col gap-[16px] items-start shrink-0 w-full">
          <div className="flex gap-[10px] items-center justify-between shrink-0 w-full">
            <p className="font-Urbanist font-bold leading-[28px] text-light-primary-text text-[18px]">
              Brand
            </p>
            <button 
                onClick={() => resetFilter('brands')}
                className="font-dm-sans font-normal leading-[24px] text-light-secondary-text text-[16px] text-right underline hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>
          
          <div className="border border-light-border border-solid h-[40px] relative rounded-[80px] shrink-0 w-full flex items-center px-3 bg-card">
             <Search className="w-5 h-5 text-muted-foreground mr-2 shrink-0" />
             <input 
                type="text" 
                placeholder="Search..." 
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full bg-transparent outline-none border-none font-dm-sans text-[16px] text-light-primary-text placeholder:text-muted-foreground"
              />
          </div>

          <div className="flex flex-col gap-[8px] items-start shrink-0 w-full max-h-[280px] overflow-y-auto custom-scrollbar pr-2">
            {isLoadingBrands ? (
                <div className="py-4 flex justify-center w-full">
                    <Loader2 className="animate-spin size-4 text-muted-foreground" />
                </div>
            ) : brands.length === 0 ? (
                <p className="text-sm text-muted-foreground">No brands</p>
            ) : (
               brands
                 .filter((brand) => brand.name?.toLowerCase().includes(brandSearch.toLowerCase()))
                 .map((brand: any) => {
                  const brandIdOrSlug = brand.slug || brand._id;
                  const checked = (filters.brands || []).includes(brandIdOrSlug);
                  return (
                      <div key={brandIdOrSlug} className="flex gap-[8px] h-[36px] items-center shrink-0 w-full group cursor-pointer" onClick={() => handleBrandToggle(brandIdOrSlug)}>
                        <Checkbox
                           checked={checked}
                           onCheckedChange={() => handleBrandToggle(brandIdOrSlug)}
                           className="rounded-full size-5 border-light-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <p className="flex-1 font-dm-sans font-normal leading-[24px] text-light-primary-text text-[16px] group-hover:text-primary transition-colors">
                          {brand.name}
                        </p>
                        <p className="font-dm-sans font-normal leading-[24px] shrink-0 text-light-secondary-text text-[16px]">
                          ( {brand.productCount || Math.floor(Math.random() * 20) + 1} )
                        </p>
                      </div>
                  )
               })
            )}
          </div>
        </div>

        <div className="h-px w-full bg-light-divider shrink-0" />

        {/* Colors Section */}
        <div className="flex flex-col gap-[16px] items-start shrink-0 w-full">
          <div className="flex gap-[10px] items-center justify-between shrink-0 w-full">
            <p className="font-Urbanist font-bold leading-[28px] text-light-primary-text text-[18px]">Colors</p>
            <button className="font-dm-sans font-normal leading-[24px] text-light-secondary-text text-[16px] text-right underline hover:text-primary transition-colors">Reset</button>
          </div>
          <div className="flex gap-[12px] items-center shrink-0 w-full">
            {['#088178', '#3366ff', '#0c53b7', '#ffc107', '#ef6168', '#ae013c'].map((color, idx) => (
              <div key={idx} className={`size-[24px] rounded-full cursor-pointer flex items-center justify-center ${idx === 0 ? 'ring-2 ring-primary ring-offset-2' : ''}`} style={{ backgroundColor: color }}>
                {idx === 0 && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-light-divider shrink-0" />

        {/* Size Section */}
        <div className="flex flex-col gap-[16px] items-start shrink-0 w-full">
          <div className="flex gap-[10px] items-center justify-between shrink-0 w-full">
            <p className="font-Urbanist font-bold leading-[28px] text-light-primary-text text-[18px]">Size</p>
            <button
               onClick={() => resetFilter('sizes')}
               className="font-dm-sans font-normal leading-[24px] text-light-secondary-text text-[16px] text-right underline hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>
          <div className="flex gap-[8px] flex-wrap items-center shrink-0 w-full">
            {['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((size) => {
              const isSelected = (filters.sizes || []).includes(size);
              return (
                <div
                  key={size}
                  onClick={() => handleSizeToggle(size)}
                  className={`rounded-full border px-[16px] py-[6px] cursor-pointer transition-colors text-[14px] font-dm-sans select-none
                    ${isSelected ? 'border-primary bg-primary/5 text-primary' : 'border-light-border hover:border-primary text-light-secondary-text'}
                  `}
                >
                  {size}
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-px w-full bg-light-divider shrink-0" />

        {/* Discount Section */}
        <div className="flex flex-col gap-[16px] items-start shrink-0 w-full">
          <div className="flex gap-[10px] items-center justify-between shrink-0 w-full">
            <p className="font-Urbanist font-bold leading-[28px] text-light-primary-text text-[18px]">Discount</p>
            <button
               onClick={() => resetFilter('discount')}
               className="font-dm-sans font-normal leading-[24px] text-light-secondary-text text-[16px] text-right underline hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>
          <div className="flex flex-col gap-[8px] items-start shrink-0 w-full">
            {[
              { label: 'upto 5%', count: 10, value: '0-5' },
              { label: '5% - 10%', count: 8, value: '5-10' },
              { label: '10% - 15%', count: 32, value: '10-15' },
              { label: '15% - 25%', count: 12, value: '15-25' },
              { label: 'More than 25%', count: 12, value: '25-' },
            ].map((d, i) => {
              const checked = (filters.discount || []).includes(d.value);
              return (
                <div
                  key={i}
                  className="flex gap-[8px] h-[36px] items-center shrink-0 w-full group cursor-pointer"
                  onClick={() => handleDiscountToggle(d.value)}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => handleDiscountToggle(d.value)}
                    className="rounded-[4px] size-5 border-light-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <p className="flex-1 font-dm-sans font-normal leading-[24px] text-light-primary-text text-[16px] group-hover:text-primary transition-colors">{d.label}</p>
                  <p className="font-dm-sans font-normal leading-[24px] shrink-0 text-light-secondary-text text-[16px]">( {d.count} )</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-px w-full bg-light-divider shrink-0" />

        {/* Pack Size Section */}
        <div className="flex flex-col gap-[16px] items-start shrink-0 w-full">
          <div className="flex gap-[10px] items-center justify-between shrink-0 w-full">
            <p className="font-Urbanist font-bold leading-[28px] text-light-primary-text text-[18px]">Pack Size</p>
            <button
               onClick={() => resetFilter('packSizes')}
               className="font-dm-sans font-normal leading-[24px] text-light-secondary-text text-[16px] text-right underline hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>
          <div className="flex flex-col gap-[8px] items-start shrink-0 w-full pb-4">
            {[
              { label: '400 to 500 g', count: 40, value: '400-500g' },
              { label: '500 to 700 g', count: 20, value: '500-700g' },
              { label: '700 to 1 kg', count: 32, value: '700-1000g' },
              { label: '120 - 150 g each vacuum', count: 20, value: '120-150g' },
              { label: '1 pc', count: 9, value: '1pc' },
            ].map((p, i) => {
              const checked = (filters.packSizes || []).includes(p.value);
              return (
                <div
                  key={i}
                  className="flex gap-[8px] h-[36px] items-center shrink-0 w-full group cursor-pointer"
                  onClick={() => handlePackSizeToggle(p.value)}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => handlePackSizeToggle(p.value)}
                    className="rounded-[4px] size-5 border-light-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <p className="flex-1 font-dm-sans font-normal leading-[24px] text-light-primary-text text-[16px] group-hover:text-primary transition-colors">{p.label}</p>
                  <p className="font-dm-sans font-normal leading-[24px] shrink-0 text-light-secondary-text text-[16px]">( {p.count < 10 ? `0${p.count}` : p.count} )</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

