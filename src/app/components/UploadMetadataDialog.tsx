import { useEffect } from "react";
import { X } from "lucide-react";
import { MetadataList } from "@/components/MetadataList";
import { Button } from "@/components/ui/button";
import type { UploadMetadata } from "@/types/upload-ui";
import type { UploadResponse } from "@shared/types/upload";
import type { SharedFileRecord } from "@shared/types/session";

type UploadMetadataDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  data: UploadMetadata | SharedFileRecord | null;
  preview?: UploadResponse["preview"];
};

export function UploadMetadataDialog({
  open,
  onClose,
  title,
  data,
  preview,
}: UploadMetadataDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !data) {
    return null;
  }

  const hasPreview = Boolean(preview?.image || preview?.text);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-metadata-title"
        className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-xl border bg-card shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0 space-y-1">
            <h2 id="upload-metadata-title" className="truncate text-lg font-semibold">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {hasPreview
                ? "Metadata and preview from this upload."
                : "Metadata only. Previews are shown once, right after upload."}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>

        <div className="space-y-5 overflow-y-auto px-5 py-4">
          <MetadataList data={data} />

          {preview?.image && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Image preview</p>
              <img
                className="max-h-52 rounded-lg border object-contain"
                src={preview.image}
                alt={`Preview of ${data.name}`}
              />
            </div>
          )}

          {preview?.text && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Text snippet</p>
              <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                {preview.text}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
