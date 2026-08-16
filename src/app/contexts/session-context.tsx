import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  assembleChunks,
  readFileChunk,
  sleep,
  triggerBrowserDownload,
} from "@/lib/file-download";
import { RECONNECT_CLOSE_REASON } from "@/lib/session-constants";
import {
  clearSessionFiles,
  loadOwnedBlobs,
  readCatalog,
  removeOwnedBlob,
  storeOwnedBlob,
  writeCatalog,
} from "@/lib/session-file-store";
import {
  buildSessionWebSocketUrl,
  createSession,
  fetchSessionStatus,
  getOrCreateClientId,
  clearSessionFromLocation,
  parseSessionIdFromInput,
  readSessionIdFromLocation,
  writeSessionToLocation,
} from "@/api/sessionsClient";
import { useFileUpload } from "@/hooks/use-file-upload";
import type { PendingUpload } from "@/types/pending-upload";
import type { UploadResponse } from "@shared/types/upload";
import {
  parseSessionMessage,
  type SessionParticipantInfo,
  type SharedFileRecord,
} from "@shared/types/session";

type SessionState = {
  sessionId: string | null;
  joinPath: string | null;
  participantCount: number;
  connected: boolean;
  creating: boolean;
  joining: boolean;
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

type CreateSessionOptions = {
  preserveFiles?: boolean;
  silent?: boolean;
};

type SessionContextValue = {
  sessionId: string | null;
  joinPath: string | null;
  participantCount: number;
  connected: boolean;
  creating: boolean;
  joining: boolean;
  isInSession: boolean;
  clientId: string;
  hostClientId: string | null;
  participants: SessionParticipantInfo[];
  sharedFiles: SharedFileRecord[];
  pendingUploads: PendingUpload[];
  selectedFile: SharedFileRecord | null;
  isDownloadingAll: boolean;
  isDeletingAll: boolean;
  createLiveSession: (options?: CreateSessionOptions) => Promise<boolean>;
  joinLiveSession: (input: string) => Promise<boolean>;
  leaveSession: () => void;
  enqueueFiles: (files: File[]) => void;
  openFilePreview: (file: SharedFileRecord) => void;
  closeFilePreview: () => void;
  removeFile: (file: SharedFileRecord) => void;
  removeAllOwnedFiles: () => void;
  downloadFile: (file: SharedFileRecord) => Promise<void>;
  downloadAllFiles: () => Promise<void>;
  isDownloading: (fileId: string) => boolean;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function sortFiles(files: SharedFileRecord[]): SharedFileRecord[] {
  return [...files].sort((a, b) => b.uploadedAt - a.uploadedAt);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const clientId = useRef(getOrCreateClientId());
  const initialSessionId = readSessionIdFromLocation();
  const sessionIdRef = useRef<string | null>(initialSessionId);
  const creationPromiseRef = useRef<Promise<boolean> | null>(null);
  const leavingRef = useRef(false);
  const createLiveSessionRef = useRef<
    (options?: CreateSessionOptions) => Promise<boolean>
  >(async () => false);

  const [state, setState] = useState<SessionState>(() => ({
    sessionId: initialSessionId,
    joinPath: initialSessionId ? `/s/${initialSessionId}` : null,
    participantCount: 0,
    connected: false,
    creating: false,
    joining: false,
  }));

  const [sharedFiles, setSharedFiles] = useState<SharedFileRecord[]>(() =>
    initialSessionId ? readCatalog(initialSessionId) : [],
  );
  const [participants, setParticipants] = useState<SessionParticipantInfo[]>(
    [],
  );
  const [hostClientId, setHostClientId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<SharedFileRecord | null>(
    null,
  );
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [downloadingFileIds, setDownloadingFileIds] = useState<Set<string>>(
    () => new Set(),
  );

  const socketRef = useRef<WebSocket | null>(null);
  const localFilesRef = useRef(new Map<string, File>());
  const incomingTransfersRef = useRef(new Map<string, IncomingTransfer>());
  const pendingAnnouncementsRef = useRef<SharedFileRecord[]>([]);
  const pendingRemovalsRef = useRef<string[]>([]);
  const suppressedFileIdsRef = useRef(new Set<string>());
  const sharedFilesRef = useRef<SharedFileRecord[]>(sharedFiles);

  useEffect(() => {
    sharedFilesRef.current = sharedFiles;
  }, [sharedFiles]);

  const persistCatalog = useCallback((sessionId: string | null) => {
    if (!sessionId) {
      return;
    }

    writeCatalog(sessionId, sharedFilesRef.current);
  }, []);

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
      if (suppressedFileIdsRef.current.has(file.fileId)) {
        continue;
      }

      sendMessage({ type: "file-added", file });
    }
  }, [sendMessage]);

  const flushPendingRemovals = useCallback(() => {
    if (pendingRemovalsRef.current.length === 0) {
      return;
    }

    const pending = [...pendingRemovalsRef.current];
    pendingRemovalsRef.current = [];

    for (const fileId of pending) {
      sendMessage({ type: "file-remove", fileId });
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

      if (suppressedFileIdsRef.current.has(fileId)) {
        continue;
      }

      sendMessage({ type: "file-added", file: record });
    }
  }, [sendMessage]);

  const upsertSharedFile = useCallback(
    (file: SharedFileRecord) => {
      setSharedFiles((current) => {
        const next = sortFiles(
          current.filter((entry) => entry.fileId !== file.fileId).concat(file),
        );
        sharedFilesRef.current = next;
        persistCatalog(sessionIdRef.current);
        return next;
      });
    },
    [persistCatalog],
  );

  const removeSharedFile = useCallback(
    (fileId: string) => {
      const sessionId = sessionIdRef.current;

      setSharedFiles((current) => {
        const removed = current.find((entry) => entry.fileId === fileId);
        const next = current.filter((entry) => entry.fileId !== fileId);
        sharedFilesRef.current = next;

        if (sessionId && removed?.ownerClientId === clientId.current) {
          removeOwnedBlob(sessionId, fileId);
        }

        persistCatalog(sessionId);
        return next;
      });

      localFilesRef.current.delete(fileId);
      incomingTransfersRef.current.delete(fileId);
      pendingAnnouncementsRef.current = pendingAnnouncementsRef.current.filter(
        (file) => file.fileId !== fileId,
      );
    },
    [persistCatalog],
  );

  const removeFilesForOwner = useCallback(
    (ownerClientId: string) => {
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
        persistCatalog(sessionIdRef.current);
        return next;
      });
    },
    [persistCatalog],
  );

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

      const sessionId = sessionIdRef.current;
      if (sessionId) {
        void storeOwnedBlob(sessionId, record.fileId, file);
      }

      if (sessionId) {
        const sent = sendMessage({ type: "file-added", file: record });
        if (!sent) {
          pendingAnnouncementsRef.current.push(record);
        }
      }
    },
    [sendMessage, upsertSharedFile],
  );

  const shareUploadedFileRef = useRef(shareUploadedFile);
  shareUploadedFileRef.current = shareUploadedFile;

  const handleUploaded = useCallback(
    async (data: UploadResponse, file: File) => {
      if (!sessionIdRef.current) {
        const created = await createLiveSessionRef.current({
          preserveFiles: true,
          silent: true,
        });
        if (!created) {
          return;
        }
      }

      shareUploadedFileRef.current(data, file);
    },
    [],
  );

  const { pendingUploads, enqueueFiles } = useFileUpload({
    onUploaded: handleUploaded,
  });

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
          persistCatalog(session.id);

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
    [persistCatalog],
  );

  createLiveSessionRef.current = createLiveSession;

  const joinLiveSession = useCallback(async (input: string): Promise<boolean> => {
    if (sessionIdRef.current) {
      return true;
    }

    const sessionId = parseSessionIdFromInput(input);
    if (!sessionId) {
      toast.error("Enter a valid session link or code.");
      return false;
    }

    setState((current) => ({ ...current, joining: true }));

    try {
      await fetchSessionStatus(sessionId);

      const catalog = readCatalog(sessionId);
      setSharedFiles(catalog);
      sharedFilesRef.current = catalog;
      localFilesRef.current.clear();
      pendingAnnouncementsRef.current = [];
      pendingRemovalsRef.current = [];
      suppressedFileIdsRef.current.clear();

      writeSessionToLocation(sessionId);
      sessionIdRef.current = sessionId;

      setState({
        sessionId,
        joinPath: `/s/${sessionId}`,
        participantCount: 0,
        connected: false,
        creating: false,
        joining: false,
      });

      toast.success("Connected to session.");
      return true;
    } catch (error) {
      setState((current) => ({ ...current, joining: false }));
      toast.error(
        error instanceof Error ? error.message : "Could not join session.",
      );
      return false;
    }
  }, []);

  useEffect(() => {
    const sessionId = state.sessionId;
    if (!sessionId) {
      return;
    }

    let cancelled = false;

    void loadOwnedBlobs(sessionId, clientId.current).then((files) => {
      if (cancelled) {
        return;
      }

      for (const [fileId, file] of files.entries()) {
        localFilesRef.current.set(fileId, file);
      }

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        offerOwnedFiles();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [state.sessionId, offerOwnedFiles]);

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
      flushPendingRemovals();
      offerOwnedFiles();
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
        case "participants":
          setHostClientId(message.hostClientId);
          setParticipants(message.participants);
          setState((current) => ({
            ...current,
            participantCount: message.participants.length,
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

            const merged = sortFiles([...remoteFiles, ...localOnly]);
            sharedFilesRef.current = merged;
            persistCatalog(sessionId);
            return merged;
          });
          break;
        case "peer-joined":
          if (message.clientId !== clientId.current) {
            offerOwnedFiles();
          }
          break;
        case "file-added":
          if (suppressedFileIdsRef.current.has(message.file.fileId)) {
            break;
          }
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
        const reason = leavingRef.current
          ? "left session"
          : RECONNECT_CLOSE_REASON;
        socket.close(1000, reason);
      }

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [
    flushPendingAnnouncements,
    flushPendingRemovals,
    fulfillIncomingTransfer,
    offerOwnedFiles,
    persistCatalog,
    removeFilesForOwner,
    removeSharedFile,
    respondToFileRequest,
    state.sessionId,
    upsertSharedFile,
  ]);

  const leaveSession = useCallback(() => {
    leavingRef.current = true;
    const sessionId = sessionIdRef.current;

    sendMessage({ type: "owner-leaving" });

    if (socketRef.current) {
      socketRef.current.close(1000, "left session");
      socketRef.current = null;
    }

    if (sessionId) {
      clearSessionFiles(sessionId);
    }

    clearSessionFromLocation();
    incomingTransfersRef.current.clear();
    pendingAnnouncementsRef.current = [];
    pendingRemovalsRef.current = [];
    suppressedFileIdsRef.current.clear();
    localFilesRef.current.clear();
    setParticipants([]);
    setHostClientId(null);
    setSelectedFile(null);

    setSharedFiles([]);
    sharedFilesRef.current = [];
    sessionIdRef.current = null;
    leavingRef.current = false;

    setState({
      sessionId: null,
      joinPath: null,
      participantCount: 0,
      connected: false,
      creating: false,
      joining: false,
    });
    toast.success("Left live session.");
  }, [sendMessage]);

  const removeFile = useCallback(
    (file: SharedFileRecord) => {
      if (file.ownerClientId !== clientId.current) {
        return;
      }

      suppressedFileIdsRef.current.add(file.fileId);
      removeSharedFile(file.fileId);

      if (sessionIdRef.current) {
        const sent = sendMessage({ type: "file-remove", fileId: file.fileId });
        if (!sent) {
          pendingRemovalsRef.current.push(file.fileId);
        }
      }

      setSelectedFile((current) =>
        current?.fileId === file.fileId ? null : current,
      );
    },
    [removeSharedFile, sendMessage],
  );

  const removeAllOwnedFiles = useCallback(() => {
    const owned = sharedFilesRef.current.filter(
      (file) => file.ownerClientId === clientId.current,
    );

    for (const file of owned) {
      removeFile(file);
    }
  }, [removeFile]);

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

    setIsDownloadingAll(true);

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
    } finally {
      setIsDownloadingAll(false);
    }
  }, [resolveFileBlob, sharedFiles]);

  const isDownloading = useCallback(
    (fileId: string) => downloadingFileIds.has(fileId),
    [downloadingFileIds],
  );

  const openFilePreview = useCallback((file: SharedFileRecord) => {
    setSelectedFile(file);
  }, []);

  const closeFilePreview = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const handleDeleteAll = useCallback(() => {
    setIsDeletingAll(true);
    try {
      removeAllOwnedFiles();
    } finally {
      setIsDeletingAll(false);
    }
  }, [removeAllOwnedFiles]);

  useEffect(() => {
    if (
      selectedFile &&
      !sharedFiles.some((file) => file.fileId === selectedFile.fileId)
    ) {
      setSelectedFile(null);
    }
  }, [selectedFile, sharedFiles]);

  const value = useMemo<SessionContextValue>(
    () => ({
      ...state,
      isInSession: state.sessionId !== null,
      clientId: clientId.current,
      hostClientId,
      participants,
      sharedFiles,
      pendingUploads,
      selectedFile,
      isDownloadingAll,
      isDeletingAll,
      createLiveSession,
      joinLiveSession,
      leaveSession,
      enqueueFiles,
      openFilePreview,
      closeFilePreview,
      removeFile,
      removeAllOwnedFiles: handleDeleteAll,
      downloadFile,
      downloadAllFiles,
      isDownloading,
    }),
    [
      state,
      hostClientId,
      participants,
      sharedFiles,
      pendingUploads,
      selectedFile,
      isDownloadingAll,
      isDeletingAll,
      createLiveSession,
      joinLiveSession,
      leaveSession,
      enqueueFiles,
      openFilePreview,
      closeFilePreview,
      removeFile,
      handleDeleteAll,
      downloadFile,
      downloadAllFiles,
      isDownloading,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within a SessionProvider.");
  }

  return context;
}
