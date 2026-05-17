import React from "react";
import Container from "@/components/common/Container";

export const Home2Skeleton = () => {
  return (
    <div className="flex flex-col w-full pb-20">
      {/* Hero Banner Skeleton */}
      <div className="w-full bg-gray-100 animate-pulse relative h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px]">
        <Container className="h-full flex flex-col justify-center gap-6 w-full">
          <div className="w-2/3 md:w-1/2 h-12 md:h-16 bg-gray-300 rounded-2xl animate-pulse" />
          <div className="w-1/2 md:w-1/3 h-6 bg-gray-200 rounded-lg animate-pulse" />
          <div className="w-[150px] h-14 bg-gray-300 rounded-xl animate-pulse mt-4" />
        </Container>
      </div>

      {/* Shop By Category Skeleton */}
      <Container className="py-10 md:py-14 w-full">
        <div className="flex justify-between items-center mb-8">
          <div className="w-1/4 h-8 bg-gray-300 animate-pulse rounded-lg" />
          <div className="w-24 h-8 bg-gray-200 animate-pulse rounded-lg" />
        </div>
        <div className="flex gap-6 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-4 shrink-0 w-[150px]">
              <div className="size-32 rounded-full bg-gray-200 animate-pulse" />
              <div className="w-20 h-4 bg-gray-300 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </Container>

      {/* Todays Top Offer Skeleton */}
      <Container className="py-10 w-full bg-gradient-to-tr from-[#FFF3EB] to-[#FFF9F5] rounded-3xl mt-10">
        <div className="w-1/3 h-10 bg-gray-300 animate-pulse rounded-lg mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4 w-full bg-white p-4 rounded-xl border border-gray-100">
              <div className="w-full aspect-square bg-gray-200 animate-pulse rounded-lg" />
              <div className="h-4 w-3/4 bg-gray-300 animate-pulse rounded" />
              <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </Container>

      {/* Three Column Banners */}
      <Container className="py-10 w-full mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-full h-[250px] bg-gray-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      </Container>

      {/* Brands Skeleton */}
      <Container className="py-10 w-full border-t border-gray-100">
        <div className="flex justify-between items-center gap-6 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-[120px] h-[60px] bg-gray-200 animate-pulse rounded-xl shrink-0" />
          ))}
        </div>
      </Container>

      {/* Main Grid Skeleton (Our Products / Newly Launched) */}
      <Container className="py-10 md:py-14 w-full">
        <div className="flex flex-col items-center justify-center mb-10 w-full gap-4">
          <div className="w-1/3 h-8 bg-gray-300 animate-pulse rounded-lg" />
          <div className="flex gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-24 h-10 bg-gray-200 animate-pulse rounded-full" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4 w-full">
              <div className="w-full aspect-[4/5] bg-gray-200 animate-pulse rounded-2xl" />
              <div className="h-4 w-2/3 bg-gray-300 animate-pulse rounded" />
              <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default Home2Skeleton;
