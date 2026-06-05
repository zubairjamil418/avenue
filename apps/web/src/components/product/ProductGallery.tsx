"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
}

const ProductGallery = ({ images }: ProductGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mainViewportRef, emblaMainApi] = useEmblaCarousel({ loop: true });
  const [thumbViewportRef, emblaThumbApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbApi) return;
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi, emblaThumbApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on("select", onSelect);
    emblaMainApi.on("reInit", onSelect);
  }, [emblaMainApi, onSelect]);

  const scrollPrev = useCallback(
    () => emblaMainApi && emblaMainApi.scrollPrev(),
    [emblaMainApi],
  );
  const scrollNext = useCallback(
    () => emblaMainApi && emblaMainApi.scrollNext(),
    [emblaMainApi],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative overflow-hidden bg-[var(--gray-50)] group" style={{ aspectRatio: "3/4" }}>
        <div className="overflow-hidden h-full" ref={mainViewportRef}>
          <div className="flex h-full">
            {images.map((src, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 relative h-full">
                <Image
                  src={src}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        </div>
        {/* Prev/Next */}
        <button onClick={scrollPrev} aria-label="Previous"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <ChevronLeft className="size-4" />
        </button>
        <button onClick={scrollNext} aria-label="Next"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Thumbnails row */}
      <div className="overflow-hidden" ref={thumbViewportRef}>
        <div className="flex gap-3">
          {images.map((src, index) => (
            <button
              key={index}
              onClick={() => onThumbClick(index)}
              className={cn(
                "relative shrink-0 w-20 h-24 overflow-hidden bg-[var(--gray-50)] transition-all",
                selectedIndex === index
                  ? "border-2 border-black"
                  : "border-2 border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <Image src={src} alt={`Thumb ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductGallery;
