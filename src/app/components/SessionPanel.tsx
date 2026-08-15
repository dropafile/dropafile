import { useCallback, useMemo } from "react";
import {
  ChevronDown,
  Copy,
  Link2,
  LoaderCircle,
  Mail,
  MessageCircle,
  QrCode,
  Users,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { buildShareUrl } from "@/api/sessionsClient";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  buildMailShareUrl,
  buildWhatsAppShareUrl,
  openShareUrl,
} from "@/lib/session-share";
import { cn } from "@/lib/utils";

type SessionPanelProps = {
  sessionId: string | null;
  joinPath: string | null;
  participantCount: number;
  connected: boolean;
  creating: boolean;
  onCreateSession: () => void;
};

export function SessionPanel({
  sessionId,
  joinPath,
  participantCount,
  connected,
  creating,
  onCreateSession,
}: SessionPanelProps) {
  const shareUrl = useMemo(() => {
    if (joinPath) {
      return buildShareUrl(joinPath);
    }
    if (sessionId) {
      return buildShareUrl(`/s/${sessionId}`);
    }
    return null;
  }, [joinPath, sessionId]);

  const copyShareLink = useCallback(async () => {
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied.");
    } catch {
      toast.error("Could not copy link.");
    }
  }, [shareUrl]);

  const shareByMail = useCallback(() => {
    if (!shareUrl) {
      return;
    }

    openShareUrl(buildMailShareUrl(shareUrl));
  }, [shareUrl]);

  const shareByWhatsApp = useCallback(() => {
    if (!shareUrl) {
      return;
    }

    openShareUrl(buildWhatsAppShareUrl(shareUrl));
  }, [shareUrl]);

  if (!sessionId) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Live session</CardTitle>
          <CardDescription>
            Create a room so others can join and receive files while someone is
            connected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onCreateSession} disabled={creating}>
            {creating ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Link2 className="size-4" />
                Start live session
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Live session</CardTitle>
            <CardDescription>
              Share this link or QR so others can join your room.
            </CardDescription>
          </div>
          <div
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1 text-sm",
              connected
                ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300"
                : "border-muted text-muted-foreground",
            )}
          >
            <Users className="size-3.5" />
            <span>
              {participantCount} connected
              {!connected ? " · reconnecting…" : ""}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {shareUrl ? (
            <div className="flex shrink-0 flex-col items-center gap-2 rounded-lg border bg-background p-3">
              <QRCodeSVG value={shareUrl} size={128} level="M" />
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <QrCode className="size-3" />
                Scan to join
              </span>
            </div>
          ) : null}

          <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Session code
              </p>
              <code className="block truncate rounded-md bg-muted px-3 py-2 text-sm">
                {sessionId}
              </code>
            </div>

            {shareUrl ? (
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Share link
                </p>
                <code className="block break-all rounded-md bg-muted px-3 py-2 text-sm">
                  {shareUrl}
                </code>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={copyShareLink}>
                <Copy className="size-4" />
                Copy link
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className={cn(buttonVariants({ variant: "default" }))}
                  disabled={!shareUrl}
                >
                  <Link2 className="size-4" />
                  Share
                  <ChevronDown className="size-4 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
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
        </div>
      </CardContent>
    </Card>
  );
}
