import { Crown, User, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AppModal,
  AppModalBody,
  AppModalHeader,
} from "@/components/ui/app-modal";
import { cn } from "@/lib/utils";
import type {
  ClientAttributes,
  SessionParticipantInfo,
} from "@shared/types/session";

type SessionDetailsDialogProps = {
  open: boolean;
  onClose: () => void;
  shareUrl: string;
  participants: SessionParticipantInfo[];
  hostClientId: string | null;
  clientId: string;
  connected: boolean;
};

function formatClientId(clientId: string): string {
  return `${clientId.slice(0, 8)}…`;
}

function formatAttributes(attributes: ClientAttributes): string {
  const parts = [
    attributes.browser,
    attributes.platform,
    attributes.country,
    attributes.language,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "Unknown device";
}

function fileCountLabel(count: number): string {
  return count === 1 ? "1 file" : `${count} files`;
}

export function SessionDetailsDialog({
  open,
  onClose,
  shareUrl,
  participants,
  hostClientId,
  clientId,
  connected,
}: SessionDetailsDialogProps) {
  return (
    <AppModal
      open={open}
      onClose={onClose}
      titleId="session-details-title"
      maxWidth="md"
    >
      <AppModalHeader
        icon={Users}
        title="Session details"
        titleId="session-details-title"
        description={
          participants.length === 0
            ? connected
              ? "No participants connected."
              : "Connecting to session…"
            : `${participants.length} connected`
        }
        headerExtra={
          <span
            className={cn(
              "size-2 shrink-0 rounded-full",
              connected ? "bg-green-500" : "bg-muted-foreground/40",
            )}
            title={connected ? "Connected" : "Reconnecting"}
          />
        }
        onClose={onClose}
      />

      <AppModalBody className="py-4">
        <p className="mb-4 break-all rounded-lg border bg-muted/30 px-3 py-2 font-mono text-xs text-muted-foreground">
          {shareUrl}
        </p>

        {participants.length === 0 ? null : (
          <ul className="space-y-2">
            {participants.map((participant) => {
              const isYou = participant.clientId === clientId;
              const isHost = participant.clientId === hostClientId;

              return (
                <li
                  key={participant.clientId}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-sm",
                    isYou && "border-primary/30 bg-primary/5",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <User className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="font-medium">
                      {isYou ? "You" : formatClientId(participant.clientId)}
                    </span>
                    {isHost ? (
                      <Badge
                        variant="secondary"
                        className="h-5 gap-0.5 px-1.5 text-[10px] font-medium"
                      >
                        <Crown className="size-2.5" />
                        Host
                      </Badge>
                    ) : null}
                  </div>

                  <p className="mt-1 text-muted-foreground">
                    {formatAttributes(participant.attributes)}
                  </p>

                  <p className="mt-0.5 tabular-nums text-muted-foreground">
                    {fileCountLabel(participant.fileCount)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </AppModalBody>
    </AppModal>
  );
}
