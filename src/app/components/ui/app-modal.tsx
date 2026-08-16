import { useEffect, type ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppModalProps = {
  open: boolean;
  onClose: () => void;
  titleId: string;
  maxWidth?: "md" | "lg" | "2xl";
  children: ReactNode;
};

type AppModalHeaderProps = {
  icon: LucideIcon;
  title: string;
  titleId: string;
  description?: ReactNode;
  headerExtra?: ReactNode;
  onClose: () => void;
};

type AppModalBodyProps = {
  children: ReactNode;
  className?: string;
};

type AppModalFooterProps = {
  children: ReactNode;
  className?: string;
};

const maxWidthClasses = {
  md: "max-w-md",
  lg: "max-w-lg",
  "2xl": "max-w-2xl",
} as const;

function AppModal({
  open,
  onClose,
  titleId,
  maxWidth = "2xl",
  children,
}: AppModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 flex max-h-[min(90vh,720px)] w-full flex-col overflow-hidden rounded-xl border bg-card shadow-xl",
          maxWidthClasses[maxWidth],
        )}
      >
        {children}
      </div>
    </div>
  );
}

function AppModalHeader({
  icon: Icon,
  title,
  titleId,
  description,
  headerExtra,
  onClose,
}: AppModalHeaderProps) {
  return (
    <div className="flex items-start gap-4 border-b px-5 py-4">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
        <Icon className="size-5 text-muted-foreground" aria-hidden />
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id={titleId} className="truncate text-lg font-semibold">
            {title}
          </h2>
          {headerExtra}
        </div>
        {description ? (
          <div className="text-sm text-muted-foreground">{description}</div>
        ) : null}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0"
        aria-label="Close"
        onClick={onClose}
      >
        <X />
      </Button>
    </div>
  );
}

function AppModalBody({ children, className }: AppModalBodyProps) {
  return (
    <div className={cn("overflow-y-auto px-5 py-5", className)}>
      {children}
    </div>
  );
}

function AppModalFooter({ children, className }: AppModalFooterProps) {
  return (
    <div
      className={cn(
        "flex justify-end gap-2 border-t bg-muted/10 px-5 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { AppModal, AppModalHeader, AppModalBody, AppModalFooter };
