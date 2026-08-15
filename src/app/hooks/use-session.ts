import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  buildSessionWebSocketUrl,
  createSession,
  parseSessionMessage,
  readSessionIdFromLocation,
  writeSessionToLocation,
} from "@/api/sessionsClient";

type SessionState = {
  sessionId: string | null;
  joinPath: string | null;
  participantCount: number;
  connected: boolean;
  creating: boolean;
};

export function useSession() {
  const initialSessionId = readSessionIdFromLocation();

  const [state, setState] = useState<SessionState>(() => ({
    sessionId: initialSessionId,
    joinPath: initialSessionId ? `/s/${initialSessionId}` : null,
    participantCount: 0,
    connected: false,
    creating: false,
  }));

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const sessionId = state.sessionId;
    if (!sessionId) {
      return;
    }

    let cancelled = false;
    const socket = new WebSocket(buildSessionWebSocketUrl(sessionId));
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      if (cancelled) {
        socket.close(1000, "cancelled");
        return;
      }

      setState((current) => ({
        ...current,
        sessionId,
        joinPath: `/s/${sessionId}`,
        connected: true,
      }));
    });

    socket.addEventListener("message", (event) => {
      const message = parseSessionMessage(String(event.data));
      if (message?.type === "presence") {
        setState((current) => ({
          ...current,
          participantCount: message.count,
        }));
      }
    });

    socket.addEventListener("close", () => {
      if (cancelled) {
        return;
      }

      setState((current) => ({
        ...current,
        connected: false,
      }));
    });

    socket.addEventListener("error", () => {
      if (!cancelled) {
        toast.error("Session connection lost.");
      }
    });

    return () => {
      cancelled = true;

      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close(1000, "tab closed");
      }

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [state.sessionId]);

  const createLiveSession = useCallback(async () => {
    setState((current) => ({ ...current, creating: true }));

    try {
      const session = await createSession();
      writeSessionToLocation(session.id);
      setState((current) => ({
        ...current,
        sessionId: session.id,
        joinPath: session.joinPath,
        participantCount: 0,
        connected: false,
        creating: false,
      }));
      toast.success("Live session created.");
    } catch (error) {
      setState((current) => ({ ...current, creating: false }));
      toast.error(
        error instanceof Error ? error.message : "Could not create session.",
      );
    }
  }, []);

  return {
    ...state,
    createLiveSession,
    isInSession: state.sessionId !== null,
  };
}
