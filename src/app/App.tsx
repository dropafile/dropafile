import { useCallback, useState } from "react";
import { Dropzone } from "@/components/Dropzone";
import { UploadHistoryList } from "@/components/UploadHistoryList";
import { UploadMetadataDialog } from "@/components/UploadMetadataDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUploadHistory } from "@/hooks/use-upload-history";
import { AppLayout } from "@/layout/AppLayout";
import type { UploadHistoryEntry } from "@/types/upload-ui";
import { SUPPORTED_FORMATS } from "@shared/utils/supportedFormats";
import type { UploadResponse } from "@shared/types/upload";

export function App() {
  const { history, addEntry } = useUploadHistory();
  const [freshUpload, setFreshUpload] = useState<UploadResponse | null>(null);
  const [freshDialogOpen, setFreshDialogOpen] = useState(false);
  const [selectedHistoryEntry, setSelectedHistoryEntry] =
    useState<UploadHistoryEntry | null>(null);

  const handleUploadSuccess = useCallback(
    (data: UploadResponse) => {
      addEntry(data);
      setFreshUpload(data);
      setFreshDialogOpen(true);
    },
    [addEntry],
  );

  const closeFreshDialog = useCallback(() => {
    setFreshDialogOpen(false);
    setFreshUpload(null);
  }, []);

  const openHistoryEntry = useCallback((entry: UploadHistoryEntry) => {
    setSelectedHistoryEntry(entry);
  }, []);

  const closeHistoryDialog = useCallback(() => {
    setSelectedHistoryEntry(null);
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <section className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Local file inspector
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Dropzone</h1>
          <p className="max-w-2xl text-muted-foreground">
            Drop a file to inspect its metadata and preview supported content
            types. Processing happens in memory through the Worker API at{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
              /api/upload
            </code>
            .
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Upload</CardTitle>
            <CardDescription>
              Drag and drop a file here, or click to browse from your computer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dropzone onUploadSuccess={handleUploadSuccess} />
          </CardContent>
        </Card>

        <UploadHistoryList history={history} onSelect={openHistoryEntry} />

        <Card>
          <CardHeader>
            <CardTitle>Supported file types</CardTitle>
            <CardDescription>
              Extensions are checked from file contents first, then filename.
              Other formats are rejected before preview.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {SUPPORTED_FORMATS.map((format) => (
                <li key={format.kind} className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary text-primary-foreground px-2.5 py-0.5 text-xs font-medium">
                      {format.kind}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {format.preview}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {format.extensions.map((ext) => (
                      <code
                        key={ext}
                        className="rounded bg-muted px-2 py-0.5 text-xs"
                      >
                        .{ext}
                      </code>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <UploadMetadataDialog
        open={freshDialogOpen}
        onClose={closeFreshDialog}
        title={freshUpload?.name ?? "Upload details"}
        data={freshUpload}
        preview={freshUpload?.preview}
      />

      <UploadMetadataDialog
        open={selectedHistoryEntry !== null}
        onClose={closeHistoryDialog}
        title={selectedHistoryEntry?.name ?? "Upload details"}
        data={selectedHistoryEntry}
      />
    </AppLayout>
  );
}
