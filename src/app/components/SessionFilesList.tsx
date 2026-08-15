import {
  Download,
  File,
  FileArchive,
  FileImage,
  FileText,
  LoaderCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatBytes } from "@shared/utils/formatBytes";
import type { SharedFileRecord } from "@shared/types/session";
import type { FileKind } from "@shared/types/upload";
import type { LucideIcon } from "lucide-react";

export type SessionFilesPanelProps = {
  files: SharedFileRecord[];
  clientId: string;
  onPreview: (file: SharedFileRecord) => void;
  onDownload: (file: SharedFileRecord) => void;
  onRemove: (file: SharedFileRecord) => void;
  isDownloading: (fileId: string) => boolean;
};

const FILE_KIND_ICONS: Record<FileKind, LucideIcon> = {
  text: FileText,
  image: FileImage,
  pdf: FileText,
  zip: FileArchive,
  unsupported: File,
};

function FileKindIcon({ kind }: { kind: FileKind }) {
  const Icon = FILE_KIND_ICONS[kind];

  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/40 transition-all duration-200",
        "group-hover/file-row:border-foreground/20 group-hover/file-row:bg-foreground group-hover/file-row:text-background",
        "group-hover/file-row:shadow-[0_0_14px_rgba(0,0,0,0.18)] dark:group-hover/file-row:shadow-[0_0_16px_rgba(255,255,255,0.22)]",
      )}
    >
      <Icon className="size-4 text-muted-foreground transition-colors group-hover/file-row:text-inherit" />
    </div>
  );
}

export function SessionFilesPanel({
  files,
  clientId,
  onPreview,
  onDownload,
  onRemove,
  isDownloading,
}: SessionFilesPanelProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {files.map((file) => {
        const downloading = isDownloading(file.fileId);
        const isOwner = file.ownerClientId === clientId;

        return (
          <li key={file.fileId}>
            <Card
              variant="ghost"
              className="flex-row items-center gap-3 px-3 py-2.5"
            >
              <button
                type="button"
                className="group/file-row flex min-w-0 flex-1 items-center gap-3 text-left"
                onClick={() => onPreview(file)}
              >
                <FileKindIcon kind={file.kind} />

                <span className="min-w-0 flex-1 truncate font-medium decoration-foreground/70 underline-offset-4 group-hover/file-row:underline">
                  {file.name}
                </span>

                <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                  {formatBytes(file.size)}
                </span>
              </button>

              <div className="flex shrink-0 items-center gap-1">
                {isOwner ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => onRemove(file)}
                  >
                    <X className="size-4" />
                  </Button>
                ) : null}

                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="size-8"
                  disabled={downloading}
                  aria-label={`Download ${file.name}`}
                  onClick={() => onDownload(file)}
                >
                  {downloading ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                </Button>
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
