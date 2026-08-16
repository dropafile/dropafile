import type { SharedFileRecord } from "@shared/types/session";

const CATALOG_PREFIX = "dropafile:catalog:";
const BLOB_PREFIX = "dropafile:blob:";

type StoredBlob = {
  name: string;
  type: string;
  lastModified: number;
  data: string;
};

function catalogKey(sessionId: string): string {
  return `${CATALOG_PREFIX}${sessionId}`;
}

function blobKey(sessionId: string, fileId: string): string {
  return `${BLOB_PREFIX}${sessionId}:${fileId}`;
}

function readJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // sessionStorage quota or private mode — ignore.
  }
}

function removeKey(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Ignore.
  }
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToFile(stored: StoredBlob): File {
  const binary = atob(stored.data);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], stored.name, {
    type: stored.type,
    lastModified: stored.lastModified,
  });
}

export function readCatalog(sessionId: string): SharedFileRecord[] {
  return readJson<SharedFileRecord[]>(catalogKey(sessionId)) ?? [];
}

export function writeCatalog(
  sessionId: string,
  files: SharedFileRecord[],
): void {
  writeJson(catalogKey(sessionId), files);
}

export async function storeOwnedBlob(
  sessionId: string,
  fileId: string,
  file: File,
): Promise<void> {
  const data = await fileToBase64(file);
  writeJson(blobKey(sessionId, fileId), {
    name: file.name,
    type: file.type,
    lastModified: file.lastModified,
    data,
  } satisfies StoredBlob);
}

export function removeOwnedBlob(sessionId: string, fileId: string): void {
  removeKey(blobKey(sessionId, fileId));
}

export async function loadOwnedBlobs(
  sessionId: string,
  ownerClientId: string,
): Promise<Map<string, File>> {
  const files = new Map<string, File>();
  const catalog = readCatalog(sessionId);

  for (const record of catalog) {
    if (record.ownerClientId !== ownerClientId) {
      continue;
    }

    const stored = readJson<StoredBlob>(blobKey(sessionId, record.fileId));
    if (!stored) {
      continue;
    }

    try {
      files.set(record.fileId, base64ToFile(stored));
    } catch {
      removeOwnedBlob(sessionId, record.fileId);
    }
  }

  return files;
}

export function clearSessionFiles(sessionId: string): void {
  const catalog = readCatalog(sessionId);

  for (const record of catalog) {
    removeOwnedBlob(sessionId, record.fileId);
  }

  removeKey(catalogKey(sessionId));
}
