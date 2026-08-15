export type {
  FileKind,
  UploadResponse,
  UploadErrorResponse,
} from "./upload";

export interface Env {
  ALLOWED_ORIGINS?: string;
  ENVIRONMENT?: string;
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
