import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  assembleChunks,
  readFileChunk,
  sleep,
  triggerBrowserDownload,
} from "@/lib/file-download";
import {
  buildSessionWebSocketUrl,
  createSession,
  getOrCreateClientId,
  clearSessionFromLocation,
  readSessionIdFromLocation,
  writeSessionToLocation,
} from "@/api/sessionsClient";
import type { UploadResponse } from "@shared/types/upload";
import {
  parseSessionMessage,
  type SharedFileRecord,
} from "@shared/types/session";

type SessionState = {
  sessionId: string | null;
  joinPath: string | null;
  participantCount: number;
  connected: boolean;
  creating: boolean;
};

type IncomingTransfer = {
  fileId: string;
  name: string;
  mimeType: string;
  totalChunks: number;
  chunks: string[];
  resolve: (blob: Blob) => void;
  reject: (error: Error) => void;
};

export function useSession() {
  const clientId = useRef(getOrCreateClientId());
  const initialSessionId = readSessionIdFromLocation();
  const sessionIdRef = useRef<string | null>(initialSessionId);
  const creationPromiseRef = useRef<Promise<boolean> | null>(null);

  const [state, setState] = useState<SessionState>(() => ({
    sessionId: initialSessionId,
    joinPath: initialSessionId ? `/s/${initialSessionId}` : null,
    participantCount: 0,
    connected: false,
    creating: false,
  }));

  const [sharedFiles, setSharedFiles] = useState<SharedFileRecord[]>([]);
  const [downloadingFileIds, setDownloadingFileIds] = useState<Set<string>>(
    () => new Set(),
  );

  const socketRef = useRef<WebSocket | null>(null);
  const localFilesRef = useRef(new Map<string, File>());
  const incomingTransfersRef = useRef(new Map<string, IncomingTransfer>());
  const pendingAnnouncementsRef = useRef<SharedFileRecord[]>([]);
  const sharedFilesRef = useRef<SharedFileRecord[]>([]);

  const sendMessage = useCallback((message: unknown) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(JSON.stringify(message));
    return true;
  }, []);

  const flushPendingAnnouncements = useCallback(() => {
    if (pendingAnnouncementsRef.current.length === 0) {
      return;
    }

    const pending = [...pendingAnnouncementsRef.current];
    pendingAnnouncementsRef.current = [];

    for (const file of pending) {
      sendMessage({ type: "file-added", file });
    }
  }, [sendMessage]);

  const offerOwnedFiles = useCallback(() => {
    for (const [fileId] of localFilesRef.current.entries()) {
      const record = sharedFilesRef.current.find(
        (entry) => entry.fileId === fileId,
      );

      if (!record || record.ownerClientId !== clientId.current) {
        continue;
      }

      sendMessage({ type: "file-added", file: record });
    }
  }, [sendMessage]);

  const upsertSharedFile = useCallback((file: SharedFileRecord) => {
    setSharedFiles((current) => {
      const next = current.filter((entry) => entry.fileId !== file.fileId);
      const merged = [file, ...next].sort((a, b) => b.uploadedAt - a.uploadedAt);
      sharedFilesRef.current = merged;
      return merged;
    });
  }, []);

  const removeSharedFile = useCallback((fileId: string) => {
    setSharedFiles((current) => {
      const next = current.filter((entry) => entry.fileId !== fileId);
      sharedFilesRef.current = next;
      return next;
    });
    localFilesRef.current.delete(fileId);
    incomingTransfersRef.current.delete(fileId);
    pendingAnnouncementsRef.current = pendingAnnouncementsRef.current.filter(
      (file) => file.fileId !== fileId,
    );
  }, []);

  const removeFilesForOwner = useCallback((ownerClientId: string) => {
    setSharedFiles((current) => {
      for (const file of current) {
        if (file.ownerClientId === ownerClientId) {
          incomingTransfersRef.current.delete(file.fileId);
        }
      }

      const next = current.filter(
        (file) => file.ownerClientId !== ownerClientId,
      );
      sharedFilesRef.current = next;
      return next;
    });
  }, []);

  const fulfillIncomingTransfer = useCallback(
    (fileId: string, chunkIndex: number, data: string) => {
      const transfer = incomingTransfersRef.current.get(fileId);
      if (!transfer) {
        return;
      }

      transfer.chunks[chunkIndex] = data;

      const received = transfer.chunks.filter(Boolean).length;
      if (received < transfer.totalChunks) {
        return;
      }

      incomingTransfersRef.current.delete(fileId);
      transfer.resolve(assembleChunks(transfer.chunks, transfer.mimeType));
    },
    [],
  );

  const requestRemoteFile = useCallback(
    (file: SharedFileRecord): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        incomingTransfersRef.current.set(file.fileId, {
          fileId: file.fileId,
          name: file.name,
          mimeType: file.detected_type ?? file.declared_type,
          totalChunks: 0,
          chunks: [],
          resolve,
          reject,
        });

        const sent = sendMessage({
          type: "file-request",
          fileId: file.fileId,
          requesterClientId: clientId.current,
        });

        if (!sent) {
          incomingTransfersRef.current.delete(file.fileId);
          reject(new Error("Session is not connected."));
        }
      });
    },
    [sendMessage],
  );

  const respondToFileRequest = useCallback(
    async (fileId: string, requesterClientId: string) => {
      const file = localFilesRef.current.get(fileId);
      if (!file) {
        sendMessage({
          type: "file-error",
          fileId,
          requesterClientId,
          message: "File is no longer available on this device.",
        });
        return;
      }

      try {
        const firstChunk = await readFileChunk(file, 0);
        const { totalChunks } = firstChunk;

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
          const chunk =
            chunkIndex === 0
              ? firstChunk
              : await readFileChunk(file, chunkIndex);

          sendMessage({
            type: "file-data",
            fileId,
            requesterClientId,
            chunkIndex: chunk.chunkIndex,
            totalChunks: chunk.totalChunks,
            data: chunk.data,
          });
        }
      } catch (error) {
        sendMessage({
          type: "file-error",
          fileId,
          requesterClientId,
          message:
            error instanceof Error ? error.message : "Failed to send file.",
        });
      }
    },
    [sendMessage],
  );

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

      flushPendingAnnouncements();
    });

    socket.addEventListener("message", (event) => {
      const message = parseSessionMessage(String(event.data));
      if (!message) {
        return;
      }

      switch (message.type) {
        case "presence":
          setState((current) => ({
            ...current,
            participantCount: message.count,
          }));
          break;
        case "file-sync":
          setSharedFiles((current) => {
            const remoteFiles = [...message.files];
            const remoteIds = new Set(remoteFiles.map((file) => file.fileId));
            const localOnly = current.filter(
              (file) =>
                file.ownerClientId === clientId.current &&
                !remoteIds.has(file.fileId),
            );

            const merged = [...remoteFiles, ...localOnly].sort(
              (a, b) => b.uploadedAt - a.uploadedAt,
            );
            sharedFilesRef.current = merged;
            return merged;
          });
          break;
        case "peer-joined":
          if (message.clientId !== clientId.current) {
            offerOwnedFiles();
          }
          break;
        case "file-added":
          upsertSharedFile(message.file);
          break;
        case "file-removed":
          removeSharedFile(message.fileId);
          break;
        case "owner-left":
          removeFilesForOwner(message.clientId);
          break;
        case "file-request":
          if (localFilesRef.current.has(message.fileId)) {
            void respondToFileRequest(
              message.fileId,
              message.requesterClientId,
            );
          }
          break;
        case "file-data":
          if (message.requesterClientId !== clientId.current) {
            break;
          }

          {
            const transfer = incomingTransfersRef.current.get(message.fileId);
            if (transfer) {
              transfer.totalChunks = message.totalChunks;
              transfer.chunks = new Array(message.totalChunks);
            }
          }

          fulfillIncomingTransfer(
            message.fileId,
            message.chunkIndex,
            message.data,
          );
          break;
        case "file-error":
          if (message.requesterClientId !== clientId.current) {
            break;
          }

          {
            const transfer = incomingTransfersRef.current.get(message.fileId);
            transfer?.reject(new Error(message.message));
            incomingTransfersRef.current.delete(message.fileId);
          }
          break;
        default:
          break;
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
  }, [
    flushPendingAnnouncements,
    fulfillIncomingTransfer,
    offerOwnedFiles,
    removeFilesForOwner,
    removeSharedFile,
    respondToFileRequest,
    state.sessionId,
    upsertSharedFile,
  ]);

  type CreateSessionOptions = {
    preserveFiles?: boolean;
    silent?: boolean;
  };

  const createLiveSession = useCallback(
    async (options?: CreateSessionOptions): Promise<boolean> => {
      if (sessionIdRef.current) {
        return true;
      }

      if (creationPromiseRef.current) {
        return creationPromiseRef.current;
      }

      const creation = (async (): Promise<boolean> => {
        setState((current) => ({ ...current, creating: true }));

        try {
          const session = await createSession();
          writeSessionToLocation(session.id);

          if (!options?.preserveFiles) {
            setSharedFiles([]);
            sharedFilesRef.current = [];
            localFilesRef.current.clear();
            pendingAnnouncementsRef.current = [];
          }

          sessionIdRef.current = session.id;
          setState((current) => ({
            ...current,
            sessionId: session.id,
            joinPath: session.joinPath,
            participantCount: 0,
            connected: false,
            creating: false,
          }));

          if (!options?.silent) {
            toast.success("Live session created.");
          }

          return true;
        } catch (error) {
          setState((current) => ({ ...current, creating: false }));
          toast.error(
            error instanceof Error ? error.message : "Could not create session.",
          );
          return false;
        }
      })();

      creationPromiseRef.current = creation;

      try {
        return await creation;
      } finally {
        creationPromiseRef.current = null;
      }
    },
    [],
  );

  const leaveSession = useCallback(() => {
    sendMessage({ type: "owner-leaving" });

    if (socketRef.current) {
      socketRef.current.close(1000, "left session");
      socketRef.current = null;
    }

    clearSessionFromLocation();
    incomingTransfersRef.current.clear();
    pendingAnnouncementsRef.current = [];

    setSharedFiles((current) => {
      const next = current.filter((file) => file.ownerClientId === clientId.current);
      sharedFilesRef.current = next;
      return next;
    });
    sessionIdRef.current = null;
    setState({
      sessionId: null,
      joinPath: null,
      participantCount: 0,
      connected: false,
      creating: false,
    });
    toast.success("Left live session.");
  }, [sendMessage]);

  const removeFile = useCallback(
    (file: SharedFileRecord) => {
      if (file.ownerClientId !== clientId.current) {
        return;
      }

      removeSharedFile(file.fileId);

      if (sessionIdRef.current) {
        sendMessage({ type: "file-remove", fileId: file.fileId });
      }
    },
    [removeSharedFile, sendMessage],
  );

  const shareUploadedFile = useCallback(
    (response: UploadResponse, file: File) => {
      const record: SharedFileRecord = {
        ...response,
        fileId: crypto.randomUUID(),
        ownerClientId: clientId.current,
        uploadedAt: Date.now(),
      };

      localFilesRef.current.set(record.fileId, file);
      upsertSharedFile(record);

      if (sessionIdRef.current) {
        const sent = sendMessage({ type: "file-added", file: record });
        if (!sent) {
          pendingAnnouncementsRef.current.push(record);
        }
      }
    },
    [sendMessage, upsertSharedFile],
  );

  const resolveFileBlob = useCallback(
    async (file: SharedFileRecord): Promise<Blob> => {
      const localFile = localFilesRef.current.get(file.fileId);
      if (localFile) {
        return localFile;
      }

      if (!state.sessionId || !state.connected) {
        throw new Error("Join a live session to download files from others.");
      }

      return requestRemoteFile(file);
    },
    [requestRemoteFile, state.connected, state.sessionId],
  );

  const downloadFile = useCallback(
    async (file: SharedFileRecord) => {
      setDownloadingFileIds((current) => new Set(current).add(file.fileId));

      try {
        const blob = await resolveFileBlob(file);
        triggerBrowserDownload(blob, file.name);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Download failed.",
        );
      } finally {
        setDownloadingFileIds((current) => {
          const next = new Set(current);
          next.delete(file.fileId);
          return next;
        });
      }
    },
    [resolveFileBlob],
  );

  const downloadAllFiles = useCallback(async () => {
    if (sharedFiles.length === 0) {
      return;
    }

    const toastId = toast.loading(
      `Downloading ${sharedFiles.length} file(s)…`,
    );

    try {
      for (const [index, file] of sharedFiles.entries()) {
        const blob = await resolveFileBlob(file);
        triggerBrowserDownload(blob, file.name);

        if (index < sharedFiles.length - 1) {
          await sleep(250);
        }
      }

      toast.success("All files downloaded.", { id: toastId });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Download all failed.",
        { id: toastId },
      );
    }
  }, [resolveFileBlob, sharedFiles]);

  const isDownloading = useCallback(
    (fileId: string) => downloadingFileIds.has(fileId),
    [downloadingFileIds],
  );

  return {
    ...state,
    clientId: clientId.current,
    sharedFiles,
    createLiveSession,
    leaveSession,
    isInSession: state.sessionId !== null,
    shareUploadedFile,
    removeFile,
    downloadFile,
    downloadAllFiles,
    isDownloading,
  };
}
