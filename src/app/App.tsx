import { useCallback, useState } from "react";
import { Dropzone } from "@/components/Dropzone";
import { SessionPanel } from "@/components/SessionPanel";
import { UploadHistoryList } from "@/components/UploadHistoryList";
import { UploadMetadataDialog } from "@/components/UploadMetadataDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/hooks/use-session";
import { useUploadHistory } from "@/hooks/use-upload-history";
import { AppLayout } from "@/layout/AppLayout";
import type { UploadHistoryEntry } from "@/types/upload-ui";
import type { UploadResponse } from "@shared/types/upload";

export function App() {
  const session = useSession();
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
            Live file sharing
          </p>
          <h1 className="text-3xl font-bold tracking-tight">dropafile</h1>
          <p className="max-w-2xl text-muted-foreground">
            Drop files anytime. Start a live session when you want others on the
            same link to see and request what you share.
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Drop a file</CardTitle>
            <CardDescription>
              {session.isInSession
                ? "Files you add here will be offered to everyone in your live session (coming next)."
                : "Drag and drop or browse — session sharing is optional."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dropzone onUploadSuccess={handleUploadSuccess} />
          </CardContent>
        </Card>

        <SessionPanel
          sessionId={session.sessionId}
          joinPath={session.joinPath}
          participantCount={session.participantCount}
          connected={session.connected}
          creating={session.creating}
          onCreateSession={() => {
            void session.createLiveSession();
          }}
        />

        <UploadHistoryList history={history} onSelect={openHistoryEntry} />
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
