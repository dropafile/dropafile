import { LandingPage } from "@/components/LandingPage";
import { SessionPanel } from "@/components/SessionPanel";
import { UploadMetadataDialog } from "@/components/UploadMetadataDialog";
import { useSession } from "@/contexts/session-context";
import { AppLayout } from "@/layout/AppLayout";

export function App() {
  const session = useSession();

  return (
    <AppLayout>
      {session.isInSession ? (
        <div className="space-y-6">
          <section className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Live session
            </p>
            <p className="max-w-2xl text-muted-foreground">
              Share the QR or link so others can join and exchange files in real
              time.
            </p>
          </section>

          <SessionPanel />
        </div>
      ) : (
        <LandingPage />
      )}

      <UploadMetadataDialog
        open={session.selectedFile !== null}
        onClose={session.closeFilePreview}
        title={session.selectedFile?.name ?? "File details"}
        data={session.selectedFile}
        clientId={session.clientId}
      />
    </AppLayout>
  );
}
