import { useApiHealth } from "@/hooks/use-api-health";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const apiStatus = useApiHealth();

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

        <div className="flex items-center gap-3">
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
