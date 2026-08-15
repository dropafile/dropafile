import type { Env } from "@shared/types/index";

const PRESENCE = "presence";

type SocketAttachment = {
  clientId: string;
  connectedAt: number;
};

function presencePayload(count: number): string {
  return JSON.stringify({ type: PRESENCE, count });
}

function isActiveSocket(socket: WebSocket): boolean {
  return (
    socket.readyState === WebSocket.OPEN ||
    socket.readyState === WebSocket.CONNECTING
  );
}

export class SessionRoom implements DurableObject {
  constructor(
    private readonly state: DurableObjectState,
    _env: Env,
  ) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.headers.get("Upgrade") === "websocket") {
      const clientId =
        url.searchParams.get("clientId")?.trim() || crypto.randomUUID();

      this.closeSocketsForClient(clientId);

      const pair = new WebSocketPair();
      const client = pair[0];
      const server = pair[1];

      this.state.acceptWebSocket(server, [`client:${clientId}`]);
      server.serializeAttachment({
        clientId,
        connectedAt: Date.now(),
      } satisfies SocketAttachment);

      this.broadcastPresence();

      return new Response(null, { status: 101, webSocket: client });
    }

    if (url.pathname.endsWith("/init") && request.method === "POST") {
      const count = this.activeSocketCount();
      return Response.json({
        participantCount: count,
        alive: count > 0,
      });
    }

    if (request.method === "GET") {
      const count = this.activeSocketCount();
      return Response.json({
        participantCount: count,
        alive: count > 0,
      });
    }

    return new Response("Not Found", { status: 404 });
  }

  webSocketClose(_ws: WebSocket): void {
    this.broadcastPresence();
  }

  webSocketError(ws: WebSocket): void {
    try {
      ws.close(1011, "WebSocket error");
    } catch {
      // Already closed.
    }
    this.broadcastPresence();
  }

  private closeSocketsForClient(clientId: string): void {
    for (const socket of this.state.getWebSockets()) {
      const attachment = socket.deserializeAttachment() as
        | SocketAttachment
        | null;

      if (attachment?.clientId !== clientId) {
        continue;
      }

      if (!isActiveSocket(socket)) {
        continue;
      }

      try {
        socket.close(1000, "replaced by newer connection");
      } catch {
        // Socket may already be closing.
      }
    }
  }

  private activeSocketCount(): number {
    return this.state.getWebSockets().filter(isActiveSocket).length;
  }

  private broadcastPresence(): void {
    const count = this.activeSocketCount();
    const payload = presencePayload(count);

    for (const socket of this.state.getWebSockets()) {
      if (!isActiveSocket(socket)) {
        continue;
      }

      try {
        socket.send(payload);
      } catch {
        // Socket may already be closing.
      }
    }
  }
}
