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
import { useSession } from "@/contexts/session-context";
import { cn } from "@/lib/utils";
import type { PendingUpload } from "@/types/pending-upload";
import { formatBytes } from "@shared/utils/formatBytes";
import type { FileKind } from "@shared/types/upload";
import type { LucideIcon } from "lucide-react";

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

function PendingUploadRow({ upload }: { upload: PendingUpload }) {
  const isQueued = upload.status === "queued";

  return (
    <li>
      <Card variant="ghost" className="flex-row items-center gap-3 px-3 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/40">
            <File className="size-4 text-muted-foreground" aria-hidden />
          </div>

          <span
            className={cn(
              "min-w-0 shrink truncate font-medium",
              isQueued ? "text-muted-foreground/80" : "text-muted-foreground",
            )}
          >
            {upload.name}
          </span>

          {isQueued ? (
            <div
              className="h-1 min-w-16 flex-1 overflow-hidden rounded-full bg-muted"
              aria-hidden
            >
              <div className="h-full w-0 rounded-full bg-primary/30" />
            </div>
          ) : (
            <div
              className="h-1 min-w-16 flex-1 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={upload.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Uploading ${upload.name}`}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${upload.progress}%` }}
              />
            </div>
          )}

          <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
            {formatBytes(upload.size)}
          </span>
        </div>
      </Card>
    </li>
  );
}

export function PendingUploadsList({
  uploads,
}: {
  uploads: PendingUpload[];
}) {
  if (uploads.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {uploads.map((upload) => (
        <PendingUploadRow key={upload.id} upload={upload} />
      ))}
    </ul>
  );
}

export function SessionFilesPanel({
  pendingUploads = [],
}: {
  pendingUploads?: PendingUpload[];
}) {
  const {
    sharedFiles: files,
    clientId,
    openFilePreview,
    downloadFile,
    removeFile,
    isDownloading,
  } = useSession();

  if (files.length === 0 && pendingUploads.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {pendingUploads.map((upload) => (
        <PendingUploadRow key={upload.id} upload={upload} />
      ))}

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
                onClick={() => openFilePreview(file)}
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
                    onClick={() => removeFile(file)}
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
                  onClick={() => {
                    void downloadFile(file);
                  }}
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
