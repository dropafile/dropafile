import { useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/api/uploadClient";
import { cn } from "@/lib/utils";
import type { UploadResponse } from "@shared/types/upload";

type DropzoneProps = {
  onUploadSuccess: (data: UploadResponse) => void;
};

export function Dropzone({ onUploadSuccess }: DropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);

    try {
      const data = await uploadFile(file);
      onUploadSuccess(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      void handleFile(file);
    }
  };

  return (
    <>
      <div
        className={cn(
          "relative flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragOver
            ? "border-primary bg-accent/40"
            : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40",
          loading && "pointer-events-none opacity-80",
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragOver(false);
        }}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        {loading ? (
          <>
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
            <span className="mt-3 text-sm text-muted-foreground">
              Processing upload…
            </span>
          </>
        ) : (
          <>
            <span className="text-lg font-medium">Drop a file here</span>
            <span className="mt-1 text-sm text-muted-foreground">
              or click to browse your local files
            </span>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={() => {
          const file = fileInputRef.current?.files?.[0];
          if (file) {
            void handleFile(file);
          }
          fileInputRef.current!.value = "";
        }}
      />
    </>
  );
}
