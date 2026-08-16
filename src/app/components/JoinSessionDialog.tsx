import { useEffect, useState } from "react";
import { LoaderCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AppModal,
  AppModalBody,
  AppModalFooter,
  AppModalHeader,
} from "@/components/ui/app-modal";
import { useSession } from "@/contexts/session-context";
import { cn } from "@/lib/utils";

type JoinSessionDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function JoinSessionDialog({ open, onClose }: JoinSessionDialogProps) {
  const { joinLiveSession, joining } = useSession();
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!open) {
      setValue("");
    }
  }, [open]);

  const handleConnect = () => {
    void (async () => {
      const joined = await joinLiveSession(value);
      if (joined) {
        onClose();
      }
    })();
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      titleId="join-session-title"
      maxWidth="md"
    >
      <AppModalHeader
        icon={LogIn}
        title="Join session"
        titleId="join-session-title"
        description="Paste a session link or enter the session code."
        onClose={onClose}
      />

      <AppModalBody className="space-y-4 py-4">
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && value.trim() && !joining) {
              handleConnect();
            }
          }}
          placeholder="https://…/s/abc123 or session code"
          autoFocus={open}
          disabled={joining}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs",
            "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
      </AppModalBody>

      <AppModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={joining}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleConnect}
          disabled={joining || !value.trim()}
        >
          {joining ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <LogIn className="size-4" />
          )}
          Connect
        </Button>
      </AppModalFooter>
    </AppModal>
  );
}
