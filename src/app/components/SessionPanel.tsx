import { useCallback, useMemo, useState } from "react";
import {
  ChevronDown,
  Copy,
  Download,
  Link2,
  LoaderCircle,
  Mail,
  MessageCircle,
  Trash2,
  Users,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { buildShareUrl } from "@/api/sessionsClient";
import { Dropzone } from "@/components/Dropzone";
import { SessionDetailsDialog } from "@/components/SessionDetailsDialog";
import { SessionFilesPanel } from "@/components/SessionFilesList";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/contexts/session-context";
import {
  buildMailShareUrl,
  buildWhatsAppShareUrl,
  openShareUrl,
} from "@/lib/session-share";
import { cn } from "@/lib/utils";

export function SessionPanel() {
  const session = useSession();
  const [qrHovered, setQrHovered] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const {
    sessionId,
    joinPath,
    sharedFiles: files,
    clientId,
    participants,
    hostClientId,
    connected,
    pendingUploads,
    enqueueFiles,
    downloadAllFiles,
    removeAllOwnedFiles,
    isDownloadingAll,
    isDeletingAll,
  } = session;

  const hasDownloadableFiles = files.length > 0;
  const ownedFileCount = files.filter(
    (file) => file.ownerClientId === clientId,
  ).length;

  const shareUrl = useMemo(() => {
    if (joinPath) {
      return buildShareUrl(joinPath);
    }
    return buildShareUrl(`/s/${sessionId}`);
  }, [joinPath, sessionId]);

  const copyShareLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied.");
    } catch {
      toast.error("Could not copy link.");
    }
  }, [shareUrl]);

  const shareByMail = useCallback(() => {
    openShareUrl(buildMailShareUrl(shareUrl));
  }, [shareUrl]);

  const shareByWhatsApp = useCallback(() => {
    openShareUrl(buildWhatsAppShareUrl(shareUrl));
  }, [shareUrl]);

  if (!sessionId) {
    return null;
  }

  return (
    <Card className="gap-0 py-0">
      <SessionDetailsDialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        shareUrl={shareUrl}
        participants={participants}
        hostClientId={hostClientId}
        clientId={clientId}
        connected={connected}
      />

      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDetailsOpen(true)}
          >
            <Users className="size-4" />
            Session details
          </Button>

          <div className="flex gap-2">
            {ownedFileCount > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={removeAllOwnedFiles}
                disabled={isDeletingAll}
              >
                {isDeletingAll ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Delete all
              </Button>
            ) : null}
            {hasDownloadableFiles ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  void downloadAllFiles();
                }}
                disabled={isDownloadingAll}
              >
                {isDownloadingAll ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Download all
              </Button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
          <div className="flex w-full shrink-0 flex-col items-center gap-3 md:w-44">
            <div
              className="group relative w-full max-w-[11rem]"
              onMouseEnter={() => setQrHovered(true)}
              onMouseLeave={() => setQrHovered(false)}
              onFocus={() => setQrHovered(true)}
              onBlur={() => setQrHovered(false)}
              tabIndex={0}
              role="img"
              aria-label={`Session QR code. Session code ${sessionId}. Hover to reveal code.`}
            >
              <div
                className={cn(
                  "rounded-lg border bg-white p-3 transition duration-200",
                  qrHovered && "blur-[3px] opacity-70",
                )}
              >
                <QRCodeSVG
                  value={shareUrl}
                  size={152}
                  level="M"
                  className="h-auto w-full"
                />
              </div>

              <div
                className={cn(
                  "pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg px-2 transition-opacity duration-200",
                  qrHovered ? "opacity-100" : "opacity-0",
                )}
              >
                <code className="rounded-md border bg-background/95 px-2 py-1.5 text-center text-xs font-medium shadow-sm backdrop-blur-sm">
                  {sessionId}
                </code>
              </div>
            </div>

            <div className="flex w-full max-w-[11rem] flex-col gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => {
                  void copyShareLink();
                }}
              >
                <Copy className="size-4" />
                Copy link
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "w-full",
                  )}
                >
                  <Link2 className="size-4" />
                  Share
                  <ChevronDown className="size-4 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-40">
                  <DropdownMenuItem onSelect={shareByMail}>
                    <Mail className="size-4" />
                    Mail
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={shareByWhatsApp}>
                    <MessageCircle className="size-4" />
                    WhatsApp
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3 border-t pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-6">
            <Dropzone compact onFilesSelected={enqueueFiles} />
            <SessionFilesPanel pendingUploads={pendingUploads} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
