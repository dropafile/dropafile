import { Link2, LoaderCircle, LogOut, Users } from "lucide-react";
import { useApiHealth } from "@/hooks/use-api-health";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppHeaderProps = {
  sessionId: string | null;
  participantCount: number;
  connected: boolean;
  creating: boolean;
  onStartSession: () => void;
  onLeaveSession: () => void;
};

export function AppHeader({
  sessionId,
  participantCount,
  connected,
  creating,
  onStartSession,
  onLeaveSession,
}: AppHeaderProps) {
  const apiStatus = useApiHealth();
  const isInSession = sessionId !== null;

  const statusLabel =
    apiStatus === "checking"
      ? "Checking API…"
      : apiStatus === "online"
        ? "API online"
        : "API offline";

  const statusColor =
    apiStatus === "checking"
      ? "bg-yellow-500"
      : apiStatus === "online"
        ? "bg-green-500"
        : "bg-red-500";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            DF
          </div>
          <span className="font-semibold">dropafile</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isInSession ? (
            <>
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs sm:gap-2 sm:px-3 sm:text-sm",
                  connected
                    ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300"
                    : "border-muted text-muted-foreground",
                )}
                title={
                  connected
                    ? `${participantCount} connected`
                    : "Reconnecting to session…"
                }
              >
                <Users className="size-3.5 shrink-0" />
                <span className="whitespace-nowrap">
                  {participantCount}
                  <span className="hidden sm:inline"> connected</span>
                  {!connected ? "…" : ""}
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onLeaveSession}
                disabled={creating}
              >
                {creating ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <LogOut className="size-4" />
                )}
                <span className="hidden sm:inline">Leave session</span>
                <span className="sm:hidden">Leave</span>
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={onStartSession}
              disabled={creating}
            >
              {creating ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Link2 className="size-4" />
              )}
              <span className="hidden sm:inline">Start live session</span>
              <span className="sm:hidden">Start</span>
            </Button>
          )}

          <div
            className="flex items-center gap-2 text-sm text-muted-foreground"
            title={statusLabel}
          >
            <span className={cn("h-2.5 w-2.5 rounded-full", statusColor)} />
            <span className="hidden sm:inline">{statusLabel}</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
