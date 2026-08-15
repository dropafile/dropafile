import type { FileKind } from "./upload";

export type SharedFileRecord = {
  fileId: string;
  ownerClientId: string;
  uploadedAt: number;
  name: string;
  declared_type: string;
  size: number;
  detected_type: string | null;
  detected_ext: string | null;
  kind: FileKind;
  metadata: Record<string, string | number | null>;
};

export type SessionPresenceMessage = {
  type: "presence";
  count: number;
};

export type SessionFileAddedMessage = {
  type: "file-added";
  file: SharedFileRecord;
};

export type SessionFileRemovedMessage = {
  type: "file-removed";
  fileId: string;
};

export type SessionFileRemoveMessage = {
  type: "file-remove";
  fileId: string;
};

export type SessionFileSyncMessage = {
  type: "file-sync";
  files: SharedFileRecord[];
};

export type SessionFileRequestMessage = {
  type: "file-request";
  fileId: string;
  requesterClientId: string;
};

export type SessionFileDataMessage = {
  type: "file-data";
  fileId: string;
  requesterClientId: string;
  chunkIndex: number;
  totalChunks: number;
  data: string;
};

export type SessionFileErrorMessage = {
  type: "file-error";
  fileId: string;
  requesterClientId: string;
  message: string;
};

export type SessionMessage =
  | SessionPresenceMessage
  | SessionFileAddedMessage
  | SessionFileRemovedMessage
  | SessionFileRemoveMessage
  | SessionFileSyncMessage
  | SessionFileRequestMessage
  | SessionFileDataMessage
  | SessionFileErrorMessage;

export type CreateSessionResponse = {
  id: string;
  joinPath: string;
};

export type SessionStatusResponse = {
  id: string;
  participantCount: number;
  alive: boolean;
};

export function parseSessionMessage(raw: string): SessionMessage | null {
  try {
    const data = JSON.parse(raw) as SessionMessage;
    if (!data || typeof data !== "object" || !("type" in data)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
