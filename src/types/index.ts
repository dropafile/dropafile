export type {
  FileKind,
  UploadResponse,
  UploadErrorResponse,
} from "./upload";

export type {
  CreateSessionResponse,
  SessionMessage,
  SessionPresenceMessage,
  SessionStatusResponse,
  SharedFileRecord,
} from "./session";

export { parseSessionMessage } from "./session";

export interface Env {
  ALLOWED_ORIGINS?: string;
  ENVIRONMENT?: string;
  SESSION_ROOM: DurableObjectNamespace;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
