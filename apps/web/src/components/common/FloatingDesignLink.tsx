import { Figma } from "lucide-react";
import Link from "next/link";

export default function FloatingDesignLink() {
  const designLink = process.env.NEXT_PUBLIC_DESIGN_LINK;

  if (!designLink) return null;

  return (
    <Link
      href={designLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-12 h-12 bg-white text-gray-800 rounded-full shadow-lg hover:bg-gray-50 transition-all duration-300 group border border-gray-200 hover:shadow-xl hover:scale-105"
      aria-label="Click to get design"
    >
      <Figma className="w-5 h-5 transition-colors duration-300 group-hover:text-[#F24E1E]" />

      {/* Tooltip */}
      <div className="absolute left-[calc(100%+12px)] px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 pointer-events-none shadow-md">
        Click to get Figma design
        {/* Tooltip arrow */}
        <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900" />
      </div>
    </Link>
  );
}
