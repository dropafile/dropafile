import { Link2, LoaderCircle, LogOut, Server, Users } from "lucide-react";
import { useApiHealth } from "@/hooks/use-api-health";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/session-context";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const {
    sessionId,
    participantCount,
    connected,
    creating,
    createLiveSession,
    leaveSession,
  } = useSession();
  const apiStatus = useApiHealth();
  const isInSession = sessionId !== null;
  const { status: healthStatus, environment } = apiStatus;

  const statusLabel =
    healthStatus === "checking"
      ? "Checking API…"
      : healthStatus === "online"
        ? `API online (${environment})`
        : "API offline";

  const statusColor =
    healthStatus === "checking"
      ? "bg-yellow-500"
      : healthStatus === "online"
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

        <div className="flex items-center gap-2">
          {isInSession ? (
            <>
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2 py-1 text-sm tabular-nums",
                  connected
                    ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300"
                    : "border-muted text-muted-foreground",
                )}
                title={
                  connected
                    ? `${participantCount} participant${participantCount === 1 ? "" : "s"}`
                    : "Reconnecting…"
                }
              >
                <Users className="size-3.5 shrink-0" aria-hidden />
                <span>{connected ? participantCount : "…"}</span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={leaveSession}
                disabled={creating}
                aria-label="Leave session"
                title="Leave session"
              >
                {creating ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <LogOut className="size-4" />
                )}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                void createLiveSession();
              }}
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
            className="relative flex size-8 items-center justify-center"
            title={statusLabel}
            aria-label={statusLabel}
            role="status"
          >
            <Server className="size-4 text-muted-foreground" aria-hidden />
            <span
              className={cn(
                "absolute right-1 top-1 size-2 rounded-full ring-2 ring-background",
                statusColor,
              )}
              aria-hidden
            />
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
