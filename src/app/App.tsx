import { useCallback, useState } from "react";
import { Dropzone } from "@/components/Dropzone";
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
    async (data: UploadResponse, file: File) => {
      if (!session.isInSession) {
        const created = await session.createLiveSession({
          preserveFiles: true,
          silent: true,
        });
        if (!created) {
          return;
        }
      }

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

  const handleRemoveFile = useCallback(
    (file: SharedFileRecord) => {
      session.removeFile(file);
      setSelectedFile((current) =>
        current?.fileId === file.fileId ? null : current,
      );
    },
    [session],
  );

  const handleDownloadAll = useCallback(async () => {
    setIsDownloadingAll(true);
    try {
      await session.downloadAllFiles();
    } finally {
      setIsDownloadingAll(false);
    }
  }, [session]);

  return (
    <AppLayout
      sessionId={session.sessionId}
      participantCount={session.participantCount}
      connected={session.connected}
      creating={session.creating}
      onStartSession={() => {
        void session.createLiveSession();
      }}
      onLeaveSession={session.leaveSession}
    >
      <div className="space-y-6">
        <section className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Live file sharing
          </p>
          <h1 className="text-3xl font-bold tracking-tight">dropafile</h1>
          <p className="max-w-2xl text-muted-foreground">
            {session.isInSession
              ? "Share the QR or link so others can join and exchange files in real time."
              : "Drop a file to start a live session instantly. Others can join and download while you stay connected."}
          </p>
        </section>

        {session.isInSession ? (
          <SessionPanel
            sessionId={session.sessionId!}
            joinPath={session.joinPath}
            files={session.sharedFiles}
            clientId={session.clientId}
            onPreview={openFilePreview}
            onDownload={(file) => {
              void session.downloadFile(file);
            }}
            onRemove={handleRemoveFile}
            onDownloadAll={() => {
              void handleDownloadAll();
            }}
            isDownloading={session.isDownloading}
            isDownloadingAll={isDownloadingAll}
            onUploadSuccess={(data, file) => {
              void handleUploadSuccess(data, file);
            }}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Drop a file</CardTitle>
              <CardDescription>
                Drag and drop or browse. A live session starts as soon as your
                file is ready.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dropzone onUploadSuccess={handleUploadSuccess} />
            </CardContent>
          </Card>
        )}
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
