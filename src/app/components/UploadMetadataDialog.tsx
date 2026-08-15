import { useEffect } from "react";
import {
  File,
  FileArchive,
  FileImage,
  FileText,
  X,
} from "lucide-react";
import { MetadataList } from "@/components/MetadataList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UploadMetadata } from "@/types/upload-ui";
import { formatBytes } from "@shared/utils/formatBytes";
import { formatKind } from "@shared/utils/formatKind";
import type { SharedFileRecord } from "@shared/types/session";
import type { FileKind } from "@shared/types/upload";
import type { LucideIcon } from "lucide-react";

type UploadMetadataDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  data: UploadMetadata | SharedFileRecord | null;
  clientId?: string;
};

const FILE_KIND_ICONS: Record<FileKind, LucideIcon> = {
  text: FileText,
  image: FileImage,
  pdf: FileText,
  zip: FileArchive,
  unsupported: File,
};

export function UploadMetadataDialog({
  open,
  onClose,
  title,
  data,
  clientId,
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

  const Icon = FILE_KIND_ICONS[data.kind];

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
        className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-card shadow-xl"
      >
        <div className="flex items-start gap-4 border-b px-5 py-4">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-lg border bg-muted/40",
            )}
          >
            <Icon className="size-5 text-muted-foreground" aria-hidden />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="upload-metadata-title"
                className="truncate text-lg font-semibold"
              >
                {title}
              </h2>
              <Badge variant="secondary">{formatKind(data.kind)}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatBytes(data.size)}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="Close"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <MetadataList data={data} clientId={clientId} />
        </div>
      </div>
    </div>
  );
}
