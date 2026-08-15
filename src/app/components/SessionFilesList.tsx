import { Download, LoaderCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@shared/utils/formatBytes";
import { formatKind } from "@shared/utils/formatKind";
import type { SharedFileRecord } from "@shared/types/session";

export type SessionFilesPanelProps = {
  files: SharedFileRecord[];
  clientId: string;
  onPreview: (file: SharedFileRecord) => void;
  onDownload: (file: SharedFileRecord) => void;
  onRemove: (file: SharedFileRecord) => void;
  isDownloading: (fileId: string) => boolean;
};

function formatUploadedAt(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function formatOwnerLabel(ownerClientId: string, clientId: string): string {
  return ownerClientId === clientId
    ? "You"
    : `Peer ${ownerClientId.slice(0, 6)}`;
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
    <ul className="divide-y overflow-y-auto rounded-lg border">
      {files.map((file) => {
        const downloading = isDownloading(file.fileId);
        const isOwner = file.ownerClientId === clientId;

        return (
          <li
            key={file.fileId}
            className="flex items-start justify-between gap-3 px-4 py-3"
          >
            <button
              type="button"
              className="min-w-0 flex-1 space-y-1 text-left transition-colors hover:opacity-80"
              onClick={() => onPreview(file)}
            >
              <p className="truncate font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatKind(file.kind)} · {formatBytes(file.size)} ·{" "}
                {formatOwnerLabel(file.ownerClientId, clientId)}
              </p>
              <time
                className="text-xs text-muted-foreground"
                dateTime={new Date(file.uploadedAt).toISOString()}
              >
                {formatUploadedAt(file.uploadedAt)}
              </time>
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
          </li>
        );
      })}
    </ul>
  );
}
