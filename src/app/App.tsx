import { useCallback, useState } from "react";
import { Dropzone } from "@/components/Dropzone";
import { SessionFilesList } from "@/components/SessionFilesList";
import { SessionPanel } from "@/components/SessionPanel";
import { UploadMetadataDialog } from "@/components/UploadMetadataDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/hooks/use-session";
import { AppLayout } from "@/layout/AppLayout";
import type { UploadResponse } from "@shared/types/upload";
import type { SharedFileRecord } from "@shared/types/session";

export function App() {
  const session = useSession();
  const [freshUpload, setFreshUpload] = useState<UploadResponse | null>(null);
  const [freshDialogOpen, setFreshDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SharedFileRecord | null>(
    null,
  );
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const handleUploadSuccess = useCallback(
    (data: UploadResponse, file: File) => {
      session.shareUploadedFile(data, file);
      setFreshUpload(data);
      setFreshDialogOpen(true);
    },
    [session],
  );

  const closeFreshDialog = useCallback(() => {
    setFreshDialogOpen(false);
    setFreshUpload(null);
  }, []);

  const openFilePreview = useCallback((file: SharedFileRecord) => {
    setSelectedFile(file);
  }, []);

  const closeFilePreview = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const handleDownloadAll = useCallback(async () => {
    setIsDownloadingAll(true);
    try {
      await session.downloadAllFiles();
    } finally {
      setIsDownloadingAll(false);
    }
  }, [session]);

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
                ? "Files you drop are shared with everyone connected to this session."
                : "Drag and drop or browse. Start a live session to share with others."}
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

        <SessionFilesList
          files={session.sharedFiles}
          clientId={session.clientId}
          isInSession={session.isInSession}
          onPreview={openFilePreview}
          onDownload={(file) => {
            void session.downloadFile(file);
          }}
          onDownloadAll={() => {
            void handleDownloadAll();
          }}
          isDownloading={session.isDownloading}
          isDownloadingAll={isDownloadingAll}
        />
      </div>

      <UploadMetadataDialog
        open={freshDialogOpen}
        onClose={closeFreshDialog}
        title={freshUpload?.name ?? "Upload details"}
        data={freshUpload}
        preview={freshUpload?.preview}
      />

      <UploadMetadataDialog
        open={selectedFile !== null}
        onClose={closeFilePreview}
        title={selectedFile?.name ?? "File details"}
        data={selectedFile}
      />
    </AppLayout>
  );
}
