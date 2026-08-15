import type { Env } from "@shared/types/index";
import type {
  SessionFileAddedMessage,
  SessionFileDataMessage,
  SessionFileErrorMessage,
  SessionFileRemovedMessage,
  SessionFileRemoveMessage,
  SessionFileRequestMessage,
  SessionMessage,
  SharedFileRecord,
} from "@shared/types/session";

type SocketAttachment = {
  clientId: string;
  connectedAt: number;
};

function presencePayload(count: number): string {
  return JSON.stringify({ type: "presence", count });
}

function isActiveSocket(socket: WebSocket): boolean {
  return (
    socket.readyState === WebSocket.OPEN ||
    socket.readyState === WebSocket.CONNECTING
  );
}

function getClientId(socket: WebSocket): string | null {
  const attachment = socket.deserializeAttachment() as SocketAttachment | null;
  return attachment?.clientId ?? null;
}

export class SessionRoom implements DurableObject {
  private readonly files = new Map<string, SharedFileRecord>();

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

      this.sendToSocket(server, {
        type: "file-sync",
        files: [...this.files.values()],
      });
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

  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): void {
    if (typeof message !== "string") {
      return;
    }

    let parsed: SessionMessage;
    try {
      parsed = JSON.parse(message) as SessionMessage;
    } catch {
      return;
    }

    const senderClientId = getClientId(ws);
    if (!senderClientId) {
      return;
    }

    switch (parsed.type) {
      case "file-added":
        this.handleFileAdded(ws, senderClientId, parsed);
        break;
      case "file-remove":
        this.handleFileRemove(senderClientId, parsed);
        break;
      case "file-request":
        this.handleFileRequest(senderClientId, parsed);
        break;
      case "file-data":
        this.handleFileData(senderClientId, parsed);
        break;
      case "file-error":
        this.handleFileError(senderClientId, parsed);
        break;
      default:
        break;
    }
  }

  webSocketClose(ws: WebSocket): void {
    const clientId = getClientId(ws);
    if (clientId) {
      this.removeFilesForOwner(clientId);
    }
    this.broadcastPresence();
  }

  webSocketError(ws: WebSocket): void {
    try {
      ws.close(1011, "WebSocket error");
    } catch {
      // Already closed.
    }
    const clientId = getClientId(ws);
    if (clientId) {
      this.removeFilesForOwner(clientId);
    }
    this.broadcastPresence();
  }

  private handleFileAdded(
    ws: WebSocket,
    senderClientId: string,
    message: SessionFileAddedMessage,
  ): void {
    const file: SharedFileRecord = {
      ...message.file,
      ownerClientId: senderClientId,
    };

    this.files.set(file.fileId, file);
    this.broadcastExcept(ws, { type: "file-added", file });
  }

  private handleFileRequest(
    senderClientId: string,
    message: SessionFileRequestMessage,
  ): void {
    const file = this.files.get(message.fileId);
    if (!file) {
      this.sendToClient(senderClientId, {
        type: "file-error",
        fileId: message.fileId,
        requesterClientId: message.requesterClientId,
        message: "File is no longer available.",
      });
      return;
    }

    if (message.requesterClientId !== senderClientId) {
      return;
    }

    this.sendToClient(file.ownerClientId, message);
  }

  private handleFileData(
    senderClientId: string,
    message: SessionFileDataMessage,
  ): void {
    const file = this.files.get(message.fileId);
    if (!file || file.ownerClientId !== senderClientId) {
      return;
    }

    this.sendToClient(message.requesterClientId, message);
  }

  private handleFileError(
    senderClientId: string,
    message: SessionFileErrorMessage,
  ): void {
    const file = this.files.get(message.fileId);
    if (!file || file.ownerClientId !== senderClientId) {
      return;
    }

    this.sendToClient(message.requesterClientId, message);
  }

  private handleFileRemove(
    senderClientId: string,
    message: SessionFileRemoveMessage,
  ): void {
    const file = this.files.get(message.fileId);
    if (!file || file.ownerClientId !== senderClientId) {
      return;
    }

    this.files.delete(message.fileId);
    this.broadcast({ type: "file-removed", fileId: message.fileId });
  }

  private removeFilesForOwner(ownerClientId: string): void {
    const removed: string[] = [];

    for (const [fileId, file] of this.files.entries()) {
      if (file.ownerClientId === ownerClientId) {
        this.files.delete(fileId);
        removed.push(fileId);
      }
    }

    for (const fileId of removed) {
      this.broadcast({ type: "file-removed", fileId });
    }
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
    this.broadcast({ type: "presence", count });
  }

  private broadcast(message: SessionMessage): void {
    const payload = JSON.stringify(message);

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

  private broadcastExcept(ws: WebSocket, message: SessionMessage): void {
    const payload = JSON.stringify(message);

    for (const socket of this.state.getWebSockets()) {
      if (socket === ws || !isActiveSocket(socket)) {
        continue;
      }

      try {
        socket.send(payload);
      } catch {
        // Socket may already be closing.
      }
    }
  }

  private sendToSocket(ws: WebSocket, message: SessionMessage): void {
    if (!isActiveSocket(ws)) {
      return;
    }

    try {
      ws.send(JSON.stringify(message));
    } catch {
      // Socket may already be closing.
    }
  }

  private sendToClient(clientId: string, message: SessionMessage): void {
    for (const socket of this.state.getWebSockets()) {
      if (getClientId(socket) !== clientId) {
        continue;
      }

      this.sendToSocket(socket, message);
      return;
    }
  }
}
