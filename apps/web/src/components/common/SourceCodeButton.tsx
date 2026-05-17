import { Code2 } from "lucide-react";

const SOURCE_CODE_URL =
  "https://codecanyon.net/item/sellzy-multivendor-ecommerce-marketplace-nodejs-script-nextjs-react-mongodb/62681835";

export default function SourceCodeButton() {
  return (
    <a
      href={SOURCE_CODE_URL}
      target="_blank"
      rel="noopener noreferrer"
      title="Get the source code"
      aria-label="Get the source code"
      className="fixed bottom-5 right-5 z-9999 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg ring-1 ring-black/5 transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Code2 className="h-4 w-4" />
      <span>Source Code</span>
    </a>
  );
}
