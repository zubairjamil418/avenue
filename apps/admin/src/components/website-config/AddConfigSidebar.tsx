import { useState, useEffect } from "react";
import { X, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import useAuthStore from "@/store/useAuthStore";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddConfigSidebarProps {
  open: boolean;
  onClose: () => void;
  editingConfig?: WebsiteConfig | null;
  defaultPageType?: string;
}

interface WebsiteConfig {
  _id?: string;
  pageType: string;
  componentType: string;
  title: string;
  description?: string;
  weight: number;
  isActive: boolean;
  settings: {
    images?: string[];
    [key: string]: unknown;
  };
}

const PAGE_TYPES = [
  { value: "home", label: "Home Page" },
  { value: "product", label: "Product Page" },
  { value: "blog", label: "Blog Page" },
  { value: "category", label: "Category Page" },
  { value: "about", label: "About Page" },
  { value: "contact", label: "Contact Page" },
];

interface ComponentType {
  _id: string;
  name: string;
  label: string;
  description?: string;
  isActive: boolean;
  structure: Record<string, unknown>;
}

export default function AddConfigSidebar({
  open,
  onClose,
  editingConfig,
  defaultPageType = "home",
}: AddConfigSidebarProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [componentTypes, setComponentTypes] = useState<ComponentType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [adsBanners, setAdsBanners] = useState<{ _id: string; name: string }[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [formData, setFormData] = useState<WebsiteConfig>({
    pageType: defaultPageType,
    componentType: "",
    title: "",
    description: "",
    weight: 0,
    isActive: true,
    settings: { images: [] },
  });

  const { token } = useAuthStore();
  const { toast } = useToast();

  // Fetch component types
  useEffect(() => {
    const fetchComponentTypes = async () => {
      setLoadingTypes(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_NEXT_PUBLIC_API_URL}/api/component-types?active=true`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setComponentTypes(response.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch component types:", error);
        setComponentTypes([]);
      } finally {
        setLoadingTypes(false);
      }
    };

    if (open) {
      fetchComponentTypes();
    }
  }, [open, token]);

  // Fetch ads banners when component type is promo-banners
  useEffect(() => {
    if (!open || formData.componentType !== "promo-banners") return;
    setLoadingBanners(true);
    axios
      .get(`${import.meta.env.VITE_NEXT_PUBLIC_API_URL}/api/ads-banners?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAdsBanners(res.data?.adsBanners || []))
      .catch(() => {})
      .finally(() => setLoadingBanners(false));
  }, [open, formData.componentType, token]);

  useEffect(() => {
    if (editingConfig) {
      setFormData({
        ...editingConfig,
        settings: {
          images: editingConfig.settings?.images || [],
          ...editingConfig.settings,
        },
      });
    } else {
      setFormData({
        pageType: defaultPageType,
        componentType: "banner",
        title: "",
        description: "",
        weight: 0,
        isActive: true,
        settings: { images: [] },
      });
    }
  }, [editingConfig, defaultPageType, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingConfig?._id) {
        // Update existing
        await axios.put(
          `${import.meta.env.VITE_NEXT_PUBLIC_API_URL}/api/website-config/${editingConfig._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast({
          title: "Success",
          description: "Configuration updated successfully",
        });
      } else {
        // Create new
        await axios.post(
          `${import.meta.env.VITE_NEXT_PUBLIC_API_URL}/api/website-config`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast({
          title: "Success",
          description: "Configuration created successfully",
        });
      }
      onClose();
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast({
        variant: "destructive",
        title: "Error",
        description:
          axiosError.response?.data?.message || "Failed to save configuration",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof WebsiteConfig,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formDataUpload = new FormData();
        formDataUpload.append("image", file);

        const response = await axios.post(
          `${import.meta.env.VITE_NEXT_PUBLIC_API_URL}/api/upload`,
          formDataUpload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data?.url) {
          uploadedUrls.push(response.data.url);
        }
      }

      const currentImages = (formData.settings.images || []) as string[];
      setFormData((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          images: [...currentImages, ...uploadedUrls],
        },
      }));

      toast({
        title: "Success",
        description: `${uploadedUrls.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast({
        variant: "destructive",
        title: "Error",
        description:
          axiosError.response?.data?.message || "Failed to upload images",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = (formData.settings.images || []) as string[];
    const updatedImages = currentImages.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        images: updatedImages,
      },
    }));
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-purple-600 flex items-center justify-between">
            {editingConfig ? "Edit Configuration" : "Add New Component"}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] pr-4 mt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Page Type */}
            <div className="space-y-2">
              <Label htmlFor="pageType">Page Type *</Label>
              <Select
                value={formData.pageType}
                onValueChange={(value) => handleInputChange("pageType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select page type" />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Component Type */}
            <div className="space-y-2">
              <Label htmlFor="componentType">Component Type *</Label>
              <Select
                value={formData.componentType}
                onValueChange={(value) =>
                  handleInputChange("componentType", value)
                }
                disabled={loadingTypes}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingTypes ? "Loading..." : "Select component type"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {componentTypes.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-grey-500">
                      No component types available. Please create one first.
                    </div>
                  ) : (
                    componentTypes.map((type) => (
                      <SelectItem key={type._id} value={type.name}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          {type.description && (
                            <div className="text-xs text-grey-500">
                              {type.description}
                            </div>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Hero Banner, Featured Products"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Optional description for internal reference"
                rows={3}
              />
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight">
                Display Order (Weight) *
                <span className="text-xs text-grey-500 ml-2">
                  Lower numbers appear first (0 = top)
                </span>
              </Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) =>
                  handleInputChange("weight", parseInt(e.target.value))
                }
                min={0}
                required
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="isActive" className="text-base font-medium">
                  Active Status
                </Label>
                <p className="text-sm text-grey-500">
                  {formData.isActive
                    ? "Component is visible on the website"
                    : "Component is hidden from the website"}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  handleInputChange("isActive", checked)
                }
              />
            </div>

            {/* Banner Assignment — only for promo-banners */}
            {formData.componentType === "promo-banners" && (
              <div className="space-y-2">
                <Label>
                  Assign Banners
                  <span className="text-xs text-grey-500 ml-2">Select which ads banners to show in this section</span>
                </Label>
                {loadingBanners ? (
                  <div className="flex items-center gap-2 text-sm text-grey-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading banners…
                  </div>
                ) : adsBanners.length === 0 ? (
                  <p className="text-sm text-grey-500">No ads banners found. Create some first.</p>
                ) : (
                  <div className="space-y-2 border rounded-lg p-3 max-h-48 overflow-y-auto">
                    {adsBanners.map((banner) => {
                      const selected: string[] = (formData.settings.bannerIds as string[]) || [];
                      const isChecked = selected.includes(banner._id);
                      return (
                        <label key={banner._id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/40 px-2 py-1 rounded">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const next = isChecked
                                ? selected.filter((id) => id !== banner._id)
                                : [...selected, banner._id];
                              setFormData((prev) => ({
                                ...prev,
                                settings: { ...prev.settings, bannerIds: next },
                              }));
                            }}
                            className="accent-primary"
                          />
                          <span className="text-sm">{banner.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Images Upload */}
            <div className="space-y-2">
              <Label htmlFor="images">
                Images (Optional)
                <span className="text-xs text-grey-500 ml-2">
                  Upload one or more images for this component
                </span>
              </Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="flex-1"
                  />
                  {uploading && (
                    <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                  )}
                </div>

                {/* Image Preview Grid */}
                {formData.settings.images &&
                  formData.settings.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {(formData.settings.images as string[]).map(
                        (url, index) => (
                          <div
                            key={index}
                            className="relative group border rounded-lg overflow-hidden"
                          >
                            <img
                              src={url}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-32 object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>
            </div>

            {/* Dynamic structure fields from the selected component type */}
            {(() => {
              const selectedType = componentTypes.find(
                (t) => t.name === formData.componentType
              );
              if (!selectedType?.structure || Object.keys(selectedType.structure).length === 0) return null;
              const fields = Object.entries(selectedType.structure as Record<string, { label?: string; type?: string; required?: boolean; defaultValue?: string }>);
              return (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                  <h4 className="text-sm font-semibold text-foreground">Component Settings</h4>
                  {fields.map(([key, meta]) => {
                    const currentVal = (formData.settings[key] as string) || meta.defaultValue || "";
                    const label = meta.label || key;
                    const type = meta.type || "text";
                    const updateSetting = (val: string) =>
                      setFormData((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, [key]: val },
                      }));
                    if (type === "textarea") {
                      return (
                        <div key={key} className="space-y-1">
                          <Label className="text-xs capitalize">{label}{meta.required && <span className="text-destructive ml-1">*</span>}</Label>
                          <textarea
                            className="w-full border rounded px-3 py-2 text-sm resize-none h-20 bg-background"
                            value={currentVal}
                            placeholder={label}
                            onChange={(e) => updateSetting(e.target.value)}
                          />
                        </div>
                      );
                    }
                    return (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs capitalize">{label}{meta.required && <span className="text-destructive ml-1">*</span>}</Label>
                        <Input
                          type={type === "url" || type === "email" ? type : "text"}
                          value={currentVal}
                          placeholder={label}
                          onChange={(e) => updateSetting(e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-main hover:bg-primary-main/90 text-white shadow-sm font-['DM_Sans',sans-serif] text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>{editingConfig ? "Update" : "Create"} Component</>
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
