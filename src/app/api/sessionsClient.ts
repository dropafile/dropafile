import type { ApiResponse } from "@shared/types/index";
import type {
  CreateSessionResponse,
  SessionStatusResponse,
} from "@shared/types/session";

async function parseApiResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !body.success) {
    const message =
      !body.success && "error" in body
        ? body.error.message
        : "Request failed.";
    throw new Error(message);
  }

  return body.data;
}

export async function createSession(): Promise<CreateSessionResponse> {
  const response = await fetch("/api/sessions", { method: "POST" });
  return parseApiResponse<CreateSessionResponse>(response);
}

export async function fetchSessionStatus(
  sessionId: string,
): Promise<SessionStatusResponse> {
  const response = await fetch(`/api/sessions/${sessionId}`);
  return parseApiResponse<SessionStatusResponse>(response);
}

const CLIENT_ID_STORAGE_KEY = "dropafile-client-id";

export function getOrCreateClientId(): string {
  const existing = sessionStorage.getItem(CLIENT_ID_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const clientId = crypto.randomUUID();
  sessionStorage.setItem(CLIENT_ID_STORAGE_KEY, clientId);
  return clientId;
}

export function buildSessionWebSocketUrl(sessionId: string): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const clientId = encodeURIComponent(getOrCreateClientId());
  return `${protocol}//${window.location.host}/api/sessions/${sessionId}/ws?clientId=${clientId}`;
}

export { parseSessionMessage } from "@shared/types/session";

export function buildShareUrl(joinPath: string): string {
  return new URL(joinPath, window.location.origin).toString();
}

export function readSessionIdFromLocation(): string | null {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("session");
  if (fromQuery) {
    return fromQuery;
  }

  const match = window.location.pathname.match(/^\/s\/([^/]+)/);
  return match?.[1] ?? null;
}

export function writeSessionToLocation(sessionId: string): void {
  const url = new URL(window.location.href);
  url.pathname = `/s/${sessionId}`;
  url.search = "";
  window.history.replaceState({}, "", url);
}

export function clearSessionFromLocation(): void {
  const url = new URL(window.location.href);
  url.pathname = "/";
  url.search = "";
  window.history.replaceState({}, "", url);
}
