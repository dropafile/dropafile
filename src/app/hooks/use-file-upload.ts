import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { uploadFileWithProgress } from "@/api/uploadClient";
import { sleep } from "@/lib/file-download";
import type { PendingUpload } from "@/types/pending-upload";
import type { UploadResponse } from "@shared/types/upload";

type UseFileUploadOptions = {
  onUploaded: (data: UploadResponse, file: File) => void | Promise<void>;
};

type QueuedFile = {
  id: string;
  file: File;
};

const MIN_VISIBLE_UPLOAD_MS = 350;
const COMPLETE_HOLD_MS = 200;
const PROGRESS_EASE = 0.08;

type UploadAnimationState = {
  targetProgress: number;
  displayProgress: number;
  startedAt: number;
  rafId: number | null;
};

function updatePendingProgress(
  setPendingUploads: React.Dispatch<React.SetStateAction<PendingUpload[]>>,
  id: string,
  progress: number,
) {
  setPendingUploads((current) =>
    current.map((entry) =>
      entry.id === id ? { ...entry, progress: Math.round(progress) } : entry,
    ),
  );
}

export function useFileUpload({ onUploaded }: UseFileUploadOptions) {
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const animationStateRef = useRef(new Map<string, UploadAnimationState>());
  const uploadQueueRef = useRef<QueuedFile[]>([]);
  const processingQueueRef = useRef(false);

  const stopAnimation = useCallback((id: string) => {
    const state = animationStateRef.current.get(id);
    if (state?.rafId !== null && state?.rafId !== undefined) {
      cancelAnimationFrame(state.rafId);
    }
    animationStateRef.current.delete(id);
  }, []);

  const runProgressAnimation = useCallback((id: string) => {
    const state = animationStateRef.current.get(id);
    if (!state) {
      return;
    }

    state.displayProgress +=
      (state.targetProgress - state.displayProgress) * PROGRESS_EASE;

    if (Math.abs(state.targetProgress - state.displayProgress) < 0.4) {
      state.displayProgress = state.targetProgress;
    }

    updatePendingProgress(setPendingUploads, id, state.displayProgress);

    const isComplete =
      state.displayProgress >= 100 && state.targetProgress >= 100;

    if (!isComplete) {
      state.rafId = requestAnimationFrame(() => runProgressAnimation(id));
    } else {
      state.rafId = null;
    }
  }, []);

  const setTargetProgress = useCallback(
    (id: string, progress: number) => {
      const state = animationStateRef.current.get(id);
      if (!state) {
        return;
      }

      state.targetProgress = Math.max(state.targetProgress, progress);

      if (state.rafId === null) {
        state.rafId = requestAnimationFrame(() => runProgressAnimation(id));
      }
    },
    [runProgressAnimation],
  );

  const waitForVisibleProgress = useCallback(
    async (id: string) => {
      const startedAt =
        animationStateRef.current.get(id)?.startedAt ?? Date.now();

      while (true) {
        const state = animationStateRef.current.get(id);
        if (!state) {
          return;
        }

        const elapsed = Date.now() - startedAt;
        const minElapsed = elapsed >= MIN_VISIBLE_UPLOAD_MS;
        const displayComplete = state.displayProgress >= 99.5;
        const targetComplete = state.targetProgress >= 100;

        if (minElapsed && displayComplete && targetComplete) {
          return;
        }

        if (
          state.rafId === null &&
          state.displayProgress < state.targetProgress
        ) {
          state.rafId = requestAnimationFrame(() => runProgressAnimation(id));
        }

        await sleep(40);
      }
    },
    [runProgressAnimation],
  );

  const processSingleUpload = useCallback(
    async ({ id, file }: QueuedFile) => {
      animationStateRef.current.set(id, {
        targetProgress: 0,
        displayProgress: 0,
        startedAt: Date.now(),
        rafId: null,
      });

      setPendingUploads((current) =>
        current.map((entry) =>
          entry.id === id ? { ...entry, status: "uploading", progress: 0 } : entry,
        ),
      );

      setTargetProgress(id, 8);
      {
        const state = animationStateRef.current.get(id);
        if (state && state.rafId === null) {
          state.rafId = requestAnimationFrame(() => runProgressAnimation(id));
        }
      }

      try {
        const data = await uploadFileWithProgress(file, (progress) => {
          setTargetProgress(id, Math.max(progress, 12));
        });

        setTargetProgress(id, 100);
        await waitForVisibleProgress(id);
        await sleep(COMPLETE_HOLD_MS);

        await onUploaded(data, file);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed.");
      } finally {
        stopAnimation(id);
        setPendingUploads((current) =>
          current.filter((entry) => entry.id !== id),
        );
      }
    },
    [
      onUploaded,
      runProgressAnimation,
      setTargetProgress,
      stopAnimation,
      waitForVisibleProgress,
    ],
  );

  const processQueue = useCallback(async () => {
    if (processingQueueRef.current) {
      return;
    }

    processingQueueRef.current = true;

    try {
      while (uploadQueueRef.current.length > 0) {
        const next = uploadQueueRef.current.shift();
        if (!next) {
          continue;
        }

        await processSingleUpload(next);
      }
    } finally {
      processingQueueRef.current = false;

      if (uploadQueueRef.current.length > 0) {
        void processQueue();
      }
    }
  }, [processSingleUpload]);

  const enqueueFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) {
        return;
      }

      const queued: QueuedFile[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
      }));

      uploadQueueRef.current.push(...queued);

      setPendingUploads((current) => [
        ...current,
        ...queued.map(({ id, file }) => ({
          id,
          name: file.name,
          size: file.size,
          progress: 0,
          status: "queued" as const,
        })),
      ]);

      void processQueue();
    },
    [processQueue],
  );

  useEffect(() => {
    const animationState = animationStateRef.current;

    return () => {
      for (const [id, state] of animationState.entries()) {
        if (state.rafId !== null) {
          cancelAnimationFrame(state.rafId);
        }
        animationState.delete(id);
      }
    };
  }, []);

  const isUploading = pendingUploads.length > 0;

  return {
    pendingUploads,
    enqueueFiles,
    isUploading,
  };
}
