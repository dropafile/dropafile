import { Download, Files, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatBytes } from "@shared/utils/formatBytes";
import { formatKind } from "@shared/utils/formatKind";
import type { SharedFileRecord } from "@shared/types/session";

type SessionFilesListProps = {
  files: SharedFileRecord[];
  clientId: string;
  isInSession: boolean;
  onPreview: (file: SharedFileRecord) => void;
  onDownload: (file: SharedFileRecord) => void;
  onDownloadAll: () => void;
  isDownloading: (fileId: string) => boolean;
  isDownloadingAll?: boolean;
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

export function SessionFilesList({
  files,
  clientId,
  isInSession,
  onPreview,
  onDownload,
  onDownloadAll,
  isDownloading,
  isDownloadingAll = false,
}: SessionFilesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Files className="size-4" />
          Session files
        </CardTitle>
        <CardDescription>
          {isInSession
            ? "Files shared by everyone in this live session."
            : "Start a live session to share files with others."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Drop a file to add it here. Others in the session can download it
            while the uploader stays connected.
          </p>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={onDownloadAll}
                disabled={isDownloadingAll}
              >
                {isDownloadingAll ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Download all
              </Button>
            </div>

            <ul className="divide-y rounded-lg border">
            {files.map((file) => {
              const downloading = isDownloading(file.fileId);

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

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={downloading}
                    onClick={() => onDownload(file)}
                  >
                    {downloading ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Download className="size-4" />
                    )}
                    Download
                  </Button>
                </li>
              );
            })}
          </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
