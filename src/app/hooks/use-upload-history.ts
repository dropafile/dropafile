import { useCallback, useState } from "react";
import { stripPreview } from "@/lib/upload-metadata";
import type { UploadHistoryEntry } from "@/types/upload-ui";
import { MAX_UPLOAD_HISTORY } from "@/types/upload-ui";
import type { UploadResponse } from "@shared/types/upload";

export function useUploadHistory() {
  const [history, setHistory] = useState<UploadHistoryEntry[]>([]);

  const addEntry = useCallback((response: UploadResponse) => {
    const entry: UploadHistoryEntry = {
      ...stripPreview(response),
      id: crypto.randomUUID(),
      uploadedAt: Date.now(),
    };

    setHistory((previous) => [entry, ...previous].slice(0, MAX_UPLOAD_HISTORY));
    return entry;
  }, []);

  return { history, addEntry };
}
