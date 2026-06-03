import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/config";

interface VideoUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function VideoUpload({ value, onChange, disabled }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadVideo = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append("video", file);
        const res = await adminApi.post("/upload/video", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const url: string = res.data?.url ?? res.data?.imageUrl ?? "";
        if (!url) throw new Error("No URL returned from upload");
        onChange(url);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Upload failed. Try pasting a URL manually.");
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "video/*": [".mp4", ".webm", ".mov", ".m4v"] },
    maxSize: 100 * 1024 * 1024, // 100 MB
    maxFiles: 1,
    disabled: disabled || uploading,
    onDrop: async (accepted) => {
      if (accepted.length > 0) await uploadVideo(accepted[0]);
    },
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setError(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <Card className="border-dashed overflow-hidden">
        <CardContent className="p-0">
          <div
            {...getRootProps({
              className: `flex flex-col items-center justify-center p-6 cursor-pointer transition-colors ${
                isDragActive ? "bg-muted/60" : ""
              } ${disabled || uploading ? "cursor-not-allowed opacity-60" : ""}`,
            })}
          >
            <input {...getInputProps()} />

            {uploading ? (
              <div className="flex flex-col items-center justify-center h-[160px] w-full">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Uploading video…</p>
              </div>
            ) : value ? (
              <div className="relative w-full">
                <video
                  src={value}
                  controls
                  className="w-full max-h-[220px] rounded-md object-contain bg-black"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemove}
                  disabled={disabled}
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[160px] w-full border border-dashed border-muted-foreground/50 rounded-md">
                <Video className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-1">
                  {isDragActive ? "Drop video here" : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground/70">MP4, WebM, MOV (max 100 MB)</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* URL field — always visible so user can paste manually or see the uploaded URL */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          Video URL
        </label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || uploading}
          placeholder="https://ik.imagekit.io/…/video.mp4"
          className="font-mono text-xs"
        />
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
