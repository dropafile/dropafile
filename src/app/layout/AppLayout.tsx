import type { ReactNode } from "react";
import { AppHeader } from "@/layout/AppHeader";

type AppLayoutProps = {
  children: ReactNode;
  sessionId: string | null;
  participantCount: number;
  connected: boolean;
  creating: boolean;
  onStartSession: () => void;
  onLeaveSession: () => void;
};

export function AppLayout({
  children,
  sessionId,
  participantCount,
  connected,
  creating,
  onStartSession,
  onLeaveSession,
}: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader
        sessionId={sessionId}
        participantCount={participantCount}
        connected={connected}
        creating={creating}
        onStartSession={onStartSession}
        onLeaveSession={onLeaveSession}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
