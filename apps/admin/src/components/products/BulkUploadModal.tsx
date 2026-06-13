import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Download,
  Loader2,
  X,
  FileSpreadsheet,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface NamedEntity {
  _id: string;
  name: string;
}

interface BulkUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: NamedEntity[];
  brands: NamedEntity[];
  sizes: NamedEntity[];
  colors: NamedEntity[];
  weights: NamedEntity[];
  productBases: { _id: string; title: string }[];
  onSuccess: () => void;
}

interface ParsedProduct {
  // Required
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  // Optional basic
  slug: string;
  discountPercentage: number;
  purchasePrice: number;
  purchasedQuantity: number;
  stock: number;
  bg: string;
  isNewItem: boolean;
  // Relational (comma-separated names in CSV → arrays)
  images: string[];
  productBase: string;
  productTypes: string;   // comma-separated names
  sizes: string;          // comma-separated names
  colors: string;         // comma-separated names
  weights: string;        // comma-separated names
  // Meta
  errors: string[];
  rowIndex: number;
}

type Step = "upload" | "verify" | "adjust" | "approve";

// Parse comma-separated string → trimmed array, filter empty
const splitCSV = (val: unknown): string =>
  String(val || "")
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");

export function BulkUploadModal({
  open,
  onOpenChange,
  categories,
  brands,
  sizes: availableSizes,
  colors: availableColors,
  weights: availableWeights,
  productBases,
  onSuccess,
}: BulkUploadModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const axiosPrivate = useAxiosPrivate();

  const steps: { key: Step; label: string; icon: typeof Upload }[] = [
    { key: "upload", label: "Upload File", icon: Upload },
    { key: "verify", label: "Verify Data", icon: CheckCircle },
    { key: "adjust", label: "Adjust & Fix", icon: AlertCircle },
    { key: "approve", label: "Approve & Upload", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  const validateProduct = (
    row: Record<string, unknown>,
    rowIndex: number
  ): ParsedProduct => {
    const errors: string[] = [];

    const name = String(row.name || "").trim();
    const description = String(row.description || "").trim();
    const category = String(row.category || "").trim();
    const brand = String(row.brand || "").trim();
    const slug = String(row.slug || "").trim();
    const bg = String(row.bg || "").trim();
    const productBase = String(row.productBase || "").trim();
    const productTypesRaw = splitCSV(row.productTypes);
    const sizesRaw = splitCSV(row.sizes);
    const colorsRaw = splitCSV(row.colors);
    const weightsRaw = splitCSV(row.weights);

    // Required
    if (!name) errors.push("Name is required");
    // description is optional in bulk upload
    if (!row.price || isNaN(Number(row.price)) || Number(row.price) <= 0)
      errors.push("Valid price > 0 is required");
    if (!category) errors.push("Category is required");
    if (!brand) errors.push("Brand is required");

    // Numeric optional fields
    const discountPercentage = Number(row.discountPercentage ?? 0);
    if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100)
      errors.push("Discount must be 0–100");

    const purchasePrice = Number(row.purchasePrice ?? 0);
    if (isNaN(purchasePrice) || purchasePrice < 0)
      errors.push("Purchase price must be >= 0");

    const purchasedQuantity = Number(row.purchasedQuantity ?? 0);
    if (isNaN(purchasedQuantity) || purchasedQuantity < 0)
      errors.push("Purchased quantity must be >= 0");

    const stock = Number(row.stock ?? 0);
    if (isNaN(stock) || stock < 0)
      errors.push("Stock must be >= 0");

    // Category / brand must match DB
    const categoryMatch = categories.find(
      (c) => c.name.toLowerCase() === category.toLowerCase()
    );
    if (category && !categoryMatch)
      errors.push(`Category "${category}" not found`);

    const brandMatch = brands.find(
      (b) => b.name.toLowerCase() === brand.toLowerCase()
    );
    if (brand && !brandMatch)
      errors.push(`Brand "${brand}" not found`);

    // productBase optional – must match if provided
    if (productBase) {
      const baseMatch = productBases.find(
        (b) => b.title.toLowerCase() === productBase.toLowerCase()
      );
      if (!baseMatch) errors.push(`Product base "${productBase}" not found`);
    }

    // bg – optional, must be valid hex if provided
    if (bg && !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(bg))
      errors.push(`BG color "${bg}" is not a valid hex (e.g. #F4F3F5)`);

    // sizes / colors / weights – validate each name against DB
    if (sizesRaw) {
      sizesRaw.split(", ").forEach((s) => {
        if (!availableSizes.find((x) => x.name.toLowerCase() === s.toLowerCase()))
          errors.push(`Size "${s}" not found`);
      });
    }
    if (colorsRaw) {
      colorsRaw.split(", ").forEach((c) => {
        if (!availableColors.find((x) => x.name.toLowerCase() === c.toLowerCase()))
          errors.push(`Color "${c}" not found`);
      });
    }
    if (weightsRaw) {
      weightsRaw.split(", ").forEach((w) => {
        if (!availableWeights.find((x) => x.name.toLowerCase() === w.toLowerCase()))
          errors.push(`Weight "${w}" not found`);
      });
    }

    // Parse images
    const images = String(row.images || "")
      .split(/[,;]/)
      .map((u) => u.trim())
      .filter(Boolean);

    // isNewItem
    const isNewItemRaw = String(row.isNewItem || "false").toLowerCase();
    const isNewItem = isNewItemRaw === "true" || isNewItemRaw === "1" || isNewItemRaw === "yes";

    return {
      name,
      description,
      price: Number(row.price) || 0,
      discountPercentage,
      purchasePrice,
      purchasedQuantity,
      stock,
      category,
      brand,
      slug,
      bg,
      isNewItem,
      images,
      productBase,
      productTypes: productTypesRaw,
      sizes: sizesRaw,
      colors: colorsRaw,
      weights: weightsRaw,
      errors,
      rowIndex,
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
      toast({ variant: "destructive", title: "Invalid File Type", description: "Please upload .xlsx, .xls or .csv" });
      return;
    }
    setFile(selectedFile);
  };

  const handleParseFile = async () => {
    if (!file) return;
    try {
      setUploading(true);
      if (file.name.endsWith(".csv")) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const validated = (results.data as Record<string, unknown>[]).map((row, i) =>
              validateProduct(row, i + 2)
            );
            setParsedProducts(validated);
            setStep("verify");
            setUploading(false);
          },
          error: () => {
            toast({ variant: "destructive", title: "Parse Error", description: "Failed to parse CSV file" });
            setUploading(false);
          },
        });
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
            const validated = json.map((row, i) => validateProduct(row, i + 2));
            setParsedProducts(validated);
            setStep("verify");
            setUploading(false);
          } catch {
            toast({ variant: "destructive", title: "Parse Error", description: "Failed to parse Excel file" });
            setUploading(false);
          }
        };
        reader.readAsArrayBuffer(file);
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to parse file" });
      setUploading(false);
    }
  };

  const updateProduct = (index: number, field: keyof ParsedProduct, value: unknown) => {
    const updated = [...parsedProducts];
    updated[index] = { ...updated[index], [field]: value };
    updated[index] = validateProduct(
      updated[index] as unknown as Record<string, unknown>,
      updated[index].rowIndex
    );
    setParsedProducts(updated);
  };

  const removeProduct = (index: number) => {
    setParsedProducts(parsedProducts.filter((_, i) => i !== index));
  };

  const resolveIds = (names: string, list: NamedEntity[]) =>
    names
      .split(", ")
      .map((n) => n.trim())
      .filter(Boolean)
      .map((n) => list.find((x) => x.name.toLowerCase() === n.toLowerCase())?._id)
      .filter(Boolean) as string[];

  const handleUploadProducts = async () => {
    try {
      setUploading(true);
      const validProducts = parsedProducts.filter((p) => p.errors.length === 0);
      if (validProducts.length === 0) {
        toast({ variant: "destructive", title: "No Valid Products", description: "Please fix all errors before uploading" });
        setUploading(false);
        return;
      }

      const productsToUpload = validProducts.map((p) => ({
        name: p.name,
        description: p.description,
        price: p.price,
        discountPercentage: p.discountPercentage,
        purchasePrice: p.purchasePrice,
        purchasedQuantity: p.purchasedQuantity,
        stock: p.stock,
        slug: p.slug || undefined,
        bg: p.bg || undefined,
        isNewItem: p.isNewItem,
        category: categories.find((c) => c.name.toLowerCase() === p.category.toLowerCase())?._id,
        brand: brands.find((b) => b.name.toLowerCase() === p.brand.toLowerCase())?._id,
        productBase: productBases.find((b) => b.title.toLowerCase() === p.productBase.toLowerCase())?._id || undefined,
        images: p.images,
        sizes: resolveIds(p.sizes, availableSizes),
        colors: resolveIds(p.colors, availableColors),
        weights: resolveIds(p.weights, availableWeights),
      }));

      const response = await axiosPrivate.post("/products/bulk", { products: productsToUpload });
      const { results } = response.data;
      const successCount = results?.successful?.length ?? validProducts.length;
      const failedCount = results?.failed?.length ?? 0;
      if (failedCount > 0) {
        const firstError = results.failed[0]?.error ?? "Unknown error";
        toast({
          variant: "destructive",
          title: `${failedCount} product(s) failed`,
          description: `First error: ${firstError}. ${successCount} uploaded successfully.`,
        });
      } else {
        toast({ title: "Success", description: `Successfully uploaded ${successCount} products` });
      }
      if (successCount > 0) {
        handleClose();
        onSuccess();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload products",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Pull real values from DB for valid sample rows
    const cat1 = categories[0]?.name ?? "";
    const cat2 = categories[1]?.name ?? cat1;
    const cat3 = categories[2]?.name ?? cat1;
    const brand1 = brands[0]?.name ?? "";
    const brand2 = brands[1]?.name ?? brand1;
    const brand3 = brands[2]?.name ?? brand1;
    const size123 = availableSizes.slice(0, 3).map((s) => s.name).join(", ");
    const size456 = availableSizes.slice(3, 6).map((s) => s.name).join(", ") || size123;
    const color12 = availableColors.slice(0, 2).map((c) => c.name).join(", ");
    const color34 = availableColors.slice(2, 4).map((c) => c.name).join(", ") || color12;
    const weight1 = availableWeights.slice(0, 2).map((w) => w.name).join(", ");
    const base1 = productBases[0]?.title ?? "";

    // ── Sheet 1: Products (sample data) ──────────────────────────────────────
    const products = [
      {
        name: "Sample Product One — Replace This Name",
        description: "Replace this with your real product description. Must be at least 10 characters long.",
        price: 199.99,
        category: cat1,
        brand: brand1,
        slug: "",
        discountPercentage: 10,
        purchasePrice: 120.00,
        purchasedQuantity: 0,
        stock: 50,
        isNewItem: true,
        productBase: base1,
        productTypes: "",
        sizes: size123,
        colors: color12,
        weights: weight1,
        images: "",
      },
      {
        name: "Sample Product Two — Replace This Name",
        description: "Replace this with your real product description. Must be at least 10 characters long.",
        price: 349.99,
        category: cat2,
        brand: brand2,
        slug: "",
        discountPercentage: 0,
        purchasePrice: 200.00,
        purchasedQuantity: 0,
        stock: 30,
        isNewItem: false,
        productBase: base1,
        productTypes: "",
        sizes: size456,
        colors: color34,
        weights: "",
        images: "",
      },
      {
        name: "Sample Product Three — Replace This Name",
        description: "Replace this with your real product description. Must be at least 10 characters long.",
        price: 89.99,
        category: cat3,
        brand: brand3,
        slug: "",
        discountPercentage: 15,
        purchasePrice: 50.00,
        purchasedQuantity: 0,
        stock: 100,
        isNewItem: false,
        productBase: "",
        productTypes: "",
        sizes: "",
        colors: color12,
        weights: "",
        images: "",
      },
    ];

    // ── Sheet 2: Instructions ─────────────────────────────────────────────────
    const instructions = [
      { "": "AVENUE PRODUCT BULK UPLOAD — FIELD GUIDE" },
      { "": "" },
      { "": "★ REQUIRED FIELDS (must be filled in — upload will fail without these)" },
      { "": "────────────────────────────────────────────────────────────────────" },
      { "": "name              | Unique product name. No two products can share the same name." },
      { "": "description       | Product description. Must be at least 10 characters." },
      { "": "price             | Selling price. Must be a number greater than 0. E.g. 199.99" },
      { "": "category          | Exact category name from your admin panel. Case-insensitive." },
      { "": "brand             | Exact brand name from your admin panel. Case-insensitive." },
      { "": "" },
      { "": "✦ OPTIONAL FIELDS (leave empty to skip or use default)" },
      { "": "────────────────────────────────────────────────────────────────────" },
      { "": "slug              | URL-friendly identifier. Leave empty → auto-generated from name." },
      { "": "discountPercentage| Sale discount as a percentage. Number from 0 to 100. Default: 0" },
      { "": "purchasePrice     | Your cost / buying price. Number >= 0. Default: 0" },
      { "": "purchasedQuantity | Base quantity already sold (for display). Number >= 0. Default: 0" },
      { "": "stock             | Available inventory count. Number >= 0. Default: 0" },
      { "": "isNewItem         | Shows 'New Arrival' badge. Enter: true or false. Default: false" },
      { "": "productBase       | Product base name (optional grouping). Must match existing base." },
      { "": "productTypes      | Comma-separated product type names. E.g. featured, trending" },
      { "": "sizes             | Comma-separated size names. E.g.  XS, S, M, L, XL  or  36, 37, 38" },
      { "": "colors            | Comma-separated colour names. E.g.  Black, White, Red" },
      { "": "weights           | Comma-separated weight names. Must match existing weight entries." },
      { "": "images            | Comma-separated full image URLs. First URL = cover image." },
      { "": "" },
      { "": "⚠ IMPORTANT NOTES" },
      { "": "────────────────────────────────────────────────────────────────────" },
      { "": "• Do NOT change column header names in the Products sheet." },
      { "": "• category and brand values must exactly match names in your admin panel." },
      { "": "• sizes, colors, weights must match existing entries in your admin panel." },
      { "": "• For multi-value fields (sizes, colors etc.) separate values with a comma." },
      { "": "• Leave slug empty — it will be auto-generated from the product name." },
      { "": "• Products without images will be created with a placeholder image." },
      { "": "• You can add or change images later from the Products page." },
      { "": "• Delete the sample rows before uploading your real data." },
    ];

    // ── Sheet 3: Valid Values (live DB data for reference) ───────────────────
    const maxRows = Math.max(
      categories.length,
      brands.length,
      availableSizes.length,
      availableColors.length,
      availableWeights.length,
      productBases.length
    );
    const validValues = Array.from({ length: maxRows }, (_, i) => ({
      "CATEGORIES (copy exact name)": categories[i]?.name ?? "",
      "BRANDS (copy exact name)": brands[i]?.name ?? "",
      "SIZES (copy exact name)": availableSizes[i]?.name ?? "",
      "COLORS (copy exact name)": availableColors[i]?.name ?? "",
      "WEIGHTS (copy exact name)": availableWeights[i]?.name ?? "",
      "PRODUCT BASES (copy exact title)": productBases[i]?.title ?? "",
    }));

    const ws1 = XLSX.utils.json_to_sheet(products);
    const ws2 = XLSX.utils.json_to_sheet(instructions, { skipHeader: true });
    const ws3 = XLSX.utils.json_to_sheet(validValues.length ? validValues : [{ note: "No data found — add categories, brands etc. first" }]);

    // Set column widths on Valid Values sheet
    ws3["!cols"] = [
      { wch: 30 }, // categories
      { wch: 30 }, // brands
      { wch: 20 }, // sizes
      { wch: 20 }, // colors
      { wch: 20 }, // weights
      { wch: 25 }, // product bases
    ];

    // Set column widths on Products sheet
    ws1["!cols"] = [
      { wch: 35 }, // name
      { wch: 60 }, // description
      { wch: 12 }, // price
      { wch: 20 }, // category
      { wch: 20 }, // brand
      { wch: 25 }, // slug
      { wch: 20 }, // discountPercentage
      { wch: 15 }, // purchasePrice
      { wch: 20 }, // purchasedQuantity
      { wch: 10 }, // stock
      { wch: 12 }, // isNewItem
      { wch: 18 }, // productBase
      { wch: 20 }, // productTypes
      { wch: 25 }, // sizes
      { wch: 25 }, // colors
      { wch: 20 }, // weights
      { wch: 60 }, // images
    ];

    // Set column width on Instructions sheet
    ws2["!cols"] = [{ wch: 80 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws1, "Products");
    XLSX.utils.book_append_sheet(workbook, ws2, "Instructions");
    XLSX.utils.book_append_sheet(workbook, ws3, "Valid Values");
    XLSX.writeFile(workbook, "avenue_product_upload_template.xlsx");
    toast({ title: "Template Downloaded", description: "Open the file — check the 'Instructions' sheet for a full field guide." });
  };

  const handleClose = () => {
    setStep("upload");
    setFile(null);
    setParsedProducts([]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onOpenChange(false);
  };

  const validProductCount = parsedProducts.filter((p) => p.errors.length === 0).length;
  const errorProductCount = parsedProducts.filter((p) => p.errors.length > 0).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[98vw] sm:max-w-[95vw] lg:max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Bulk Upload Products</DialogTitle>
          <DialogDescription>Upload multiple products at once using Excel or CSV file</DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = s.key === step;
            const isCompleted = index < currentStepIndex;
            return (
              <div key={s.key} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-colors ${
                    isCompleted ? "bg-success-main border-success-main text-white"
                    : isActive ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-muted-foreground/30 text-muted-foreground"
                  }`}>
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <p className={`text-xs sm:text-sm font-medium mt-2 text-center ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mx-1 sm:mx-2 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Upload ── */}
        {step === "upload" && (
          <div className="space-y-6">
            <div className="border-2 border-dashed rounded-lg p-8 sm:p-12 text-center space-y-4">
              <div className="flex justify-center">
                <FileSpreadsheet className="h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">Upload Your Product File</h3>
                <p className="text-sm text-muted-foreground mb-4">Supported formats: Excel (.xlsx, .xls) or CSV (.csv)</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Label htmlFor="bulk-file" className="cursor-pointer inline-block">
                  <div className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium">
                    Choose File
                  </div>
                  <Input id="bulk-file" ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />
                </Label>
                <Button type="button" variant="outline" onClick={handleDownloadTemplate} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
              </div>
              {file && (
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <p className="text-sm font-medium">Selected: {file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              )}
            </div>

            <div className="bg-info-lighter border border-info-lighter rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-info-main" />
                Template Column Guide
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1">Required</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li><strong>name</strong> — product name (unique)</li>
                    <li><strong>description</strong> — min 10 characters</li>
                    <li><strong>price</strong> — number {">"} 0</li>
                    <li><strong>category</strong> — must match existing</li>
                    <li><strong>brand</strong> — must match existing</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Optional</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li><strong>slug</strong> — auto-generated if empty</li>
                    <li><strong>discountPercentage</strong> — 0–100</li>
                    <li><strong>purchasePrice</strong> — cost price</li>
                    <li><strong>purchasedQuantity</strong> — base qty</li>
                    <li><strong>stock</strong> — inventory count</li>
                    <li><strong>isNewItem</strong> — true / false</li>
                    <li><strong>productBase</strong> — base name</li>
                    <li><strong>sizes</strong> — comma-separated names</li>
                    <li><strong>colors</strong> — comma-separated names</li>
                    <li><strong>weights</strong> — comma-separated names</li>
                    <li><strong>images</strong> — comma-separated URLs</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleParseFile} disabled={!file || uploading}>
                {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Parsing...</> : <>Continue<ChevronRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Verify ── */}
        {step === "verify" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-card border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{parsedProducts.length}</p>
              </div>
              <div className="bg-success-lighter border border-success-lighter rounded-lg p-4">
                <p className="text-sm text-success-dark">Valid Products</p>
                <p className="text-2xl font-bold text-success-main">{validProductCount}</p>
              </div>
              <div className="bg-error-lighter border border-error-lighter rounded-lg p-4">
                <p className="text-sm text-error-dark">Errors Found</p>
                <p className="text-2xl font-bold text-error-main">{errorProductCount}</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Row</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Sizes</TableHead>
                    <TableHead>Colors</TableHead>
                    <TableHead>New?</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedProducts.map((product, index) => (
                    <TableRow key={index} className={product.errors.length > 0 ? "bg-error-lighter" : ""}>
                      <TableCell className="font-medium">{product.rowIndex}</TableCell>
                      <TableCell className="max-w-[160px] truncate">{product.name}</TableCell>
                      <TableCell>£{product.price}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell className="max-w-[100px] truncate text-xs">{product.sizes || "—"}</TableCell>
                      <TableCell className="max-w-[100px] truncate text-xs">{product.colors || "—"}</TableCell>
                      <TableCell>{product.isNewItem ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        {product.errors.length === 0 ? (
                          <span className="inline-flex items-center gap-1 text-success-main"><CheckCircle className="h-4 w-4" />Valid</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-error-main"><AlertCircle className="h-4 w-4" />{product.errors.length} error(s)</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep("upload")}><ChevronLeft className="mr-2 h-4 w-4" />Back</Button>
              <Button onClick={() => setStep("adjust")}>Continue<ChevronRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Adjust ── */}
        {step === "adjust" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review and fix any errors. Edit fields inline or remove rows. Multi-value fields (sizes, colors, weights) use comma-separated names.
            </p>

            <div className="border rounded-lg overflow-auto max-h-[520px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-10">Row</TableHead>
                    <TableHead className="min-w-[140px]">Name*</TableHead>
                    <TableHead className="min-w-[90px]">Price*</TableHead>
                    <TableHead className="min-w-[75px]">Disc%</TableHead>
                    <TableHead className="min-w-[75px]">Buy Price</TableHead>
                    <TableHead className="min-w-[65px]">Stock</TableHead>
                    <TableHead className="min-w-[120px]">Category*</TableHead>
                    <TableHead className="min-w-[120px]">Brand*</TableHead>
                    <TableHead className="min-w-[110px]">Product Base</TableHead>
                    <TableHead className="min-w-[110px]">Sizes</TableHead>
                    <TableHead className="min-w-[110px]">Colors</TableHead>
                    <TableHead className="min-w-[110px]">Weights</TableHead>
                    <TableHead className="min-w-[120px]">Slug</TableHead>
                    <TableHead className="min-w-[200px]">Images (comma-separated URLs)</TableHead>
                    <TableHead className="min-w-[65px]">New?</TableHead>
                    <TableHead className="min-w-[150px]">Errors</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedProducts.map((product, index) => (
                    <TableRow key={index} className={product.errors.length > 0 ? "bg-error-lighter" : ""}>
                      <TableCell className="text-xs">{product.rowIndex}</TableCell>

                      {/* Name */}
                      <TableCell>
                        <Input value={product.name} onChange={(e) => updateProduct(index, "name", e.target.value)} className="min-w-[140px] h-8 text-xs" />
                      </TableCell>

                      {/* Price */}
                      <TableCell>
                        <Input type="number" value={product.price} onChange={(e) => updateProduct(index, "price", Number(e.target.value))} className="min-w-[90px] h-8 text-xs" />
                      </TableCell>

                      {/* Discount */}
                      <TableCell>
                        <Input type="number" value={product.discountPercentage} onChange={(e) => updateProduct(index, "discountPercentage", Number(e.target.value))} className="min-w-[75px] h-8 text-xs" />
                      </TableCell>

                      {/* Purchase Price */}
                      <TableCell>
                        <Input type="number" value={product.purchasePrice} onChange={(e) => updateProduct(index, "purchasePrice", Number(e.target.value))} className="min-w-[75px] h-8 text-xs" />
                      </TableCell>

                      {/* Stock */}
                      <TableCell>
                        <Input type="number" value={product.stock} onChange={(e) => updateProduct(index, "stock", Number(e.target.value))} className="min-w-[65px] h-8 text-xs" />
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <Select value={product.category} onValueChange={(v) => updateProduct(index, "category", v)}>
                          <SelectTrigger className="min-w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => <SelectItem key={c._id} value={c.name} className="text-xs">{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Brand */}
                      <TableCell>
                        <Select value={product.brand} onValueChange={(v) => updateProduct(index, "brand", v)}>
                          <SelectTrigger className="min-w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {brands.map((b) => <SelectItem key={b._id} value={b.name} className="text-xs">{b.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Product Base */}
                      <TableCell>
                        <Select value={product.productBase || "__none__"} onValueChange={(v) => updateProduct(index, "productBase", v === "__none__" ? "" : v)}>
                          <SelectTrigger className="min-w-[110px] h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__" className="text-xs">None</SelectItem>
                            {productBases.map((b) => <SelectItem key={b._id} value={b.title} className="text-xs">{b.title}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Sizes (comma-sep text) */}
                      <TableCell>
                        <Input value={product.sizes} onChange={(e) => updateProduct(index, "sizes", e.target.value)} placeholder="S, M, L" className="min-w-[110px] h-8 text-xs" />
                      </TableCell>

                      {/* Colors */}
                      <TableCell>
                        <Input value={product.colors} onChange={(e) => updateProduct(index, "colors", e.target.value)} placeholder="Red, Blue" className="min-w-[110px] h-8 text-xs" />
                      </TableCell>

                      {/* Weights */}
                      <TableCell>
                        <Input value={product.weights} onChange={(e) => updateProduct(index, "weights", e.target.value)} placeholder="1kg, 2kg" className="min-w-[110px] h-8 text-xs" />
                      </TableCell>

                      {/* Slug */}
                      <TableCell>
                        <Input value={product.slug} onChange={(e) => updateProduct(index, "slug", e.target.value)} placeholder="auto-generated" className="min-w-[120px] h-8 text-xs" />
                      </TableCell>

                      {/* Images */}
                      <TableCell>
                        <Input
                          value={Array.isArray(product.images) ? product.images.join(", ") : product.images}
                          onChange={(e) => updateProduct(index, "images", e.target.value.split(",").map((u) => u.trim()).filter(Boolean))}
                          placeholder="https://..., https://..."
                          className="min-w-[200px] h-8 text-xs"
                        />
                      </TableCell>

                      {/* isNewItem */}
                      <TableCell>
                        <Select value={product.isNewItem ? "true" : "false"} onValueChange={(v) => updateProduct(index, "isNewItem", v === "true")}>
                          <SelectTrigger className="min-w-[65px] h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="false" className="text-xs">No</SelectItem>
                            <SelectItem value="true" className="text-xs">Yes</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Errors */}
                      <TableCell>
                        {product.errors.length > 0 ? (
                          <div className="text-xs text-error-main space-y-0.5 min-w-[150px]">
                            {product.errors.map((err, i) => <div key={i}>• {err}</div>)}
                          </div>
                        ) : (
                          <span className="text-success-main text-xs">✓ Valid</span>
                        )}
                      </TableCell>

                      {/* Remove */}
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeProduct(index)} className="h-8 w-8">
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep("verify")}><ChevronLeft className="mr-2 h-4 w-4" />Back</Button>
              <Button onClick={() => setStep("approve")} disabled={validProductCount === 0}>
                Continue to Approve<ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Approve ── */}
        {step === "approve" && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-success-lighter flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-success-main" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Ready to Upload</h3>
                <p className="text-muted-foreground">{validProductCount} product(s) are ready to be uploaded to your store</p>
              </div>
            </div>

            <div className="border rounded-lg p-6 space-y-4 bg-muted/30">
              <h4 className="font-semibold">Upload Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{parsedProducts.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valid Products</p>
                  <p className="text-2xl font-bold text-success-main">{validProductCount}</p>
                </div>
                {errorProductCount > 0 && (
                  <div className="col-span-2">
                    <p className="text-sm text-error-main">{errorProductCount} product(s) with errors will be skipped</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-warning-lighter border border-warning-lighter rounded-lg p-4">
              <p className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-warning-main" />
                Important Notes
              </p>
              <ul className="text-xs sm:text-sm mt-2 space-y-1 text-muted-foreground list-disc list-inside">
                <li>Products without image URLs will be created with placeholder images</li>
                <li>Slugs are auto-generated from name if left empty</li>
                <li>Sizes, colors, weights must match existing entries exactly</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep("adjust")} disabled={uploading}>
                <ChevronLeft className="mr-2 h-4 w-4" />Back
              </Button>
              <Button onClick={handleUploadProducts} disabled={uploading || validProductCount === 0} className="bg-success-main hover:bg-success-dark">
                {uploading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</>
                ) : (
                  <><Upload className="mr-2 h-4 w-4" />Upload {validProductCount} Product(s)</>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
