import { History } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatBytes } from "@shared/utils/formatBytes";
import { formatKind } from "@shared/utils/formatKind";
import type { UploadHistoryEntry } from "@/types/upload-ui";
import { MAX_UPLOAD_HISTORY } from "@/types/upload-ui";

type UploadHistoryListProps = {
  history: UploadHistoryEntry[];
  onSelect: (entry: UploadHistoryEntry) => void;
};

function formatUploadedAt(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export function UploadHistoryList({ history, onSelect }: UploadHistoryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="size-4" />
          Recent uploads
        </CardTitle>
        <CardDescription>
          Metadata for the latest {MAX_UPLOAD_HISTORY} uploads stays in memory.
          Previews are not stored and cannot be reopened.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Upload a file to start building history.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {history.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                  onClick={() => onSelect(entry)}
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-medium">{entry.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatKind(entry.kind)} · {formatBytes(entry.size)}
                    </p>
                  </div>
                  <time
                    className="shrink-0 text-xs text-muted-foreground"
                    dateTime={new Date(entry.uploadedAt).toISOString()}
                  >
                    {formatUploadedAt(entry.uploadedAt)}
                  </time>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
