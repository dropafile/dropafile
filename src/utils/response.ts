import type { ApiResponse, ErrorResponse, SuccessResponse } from "@shared/types/index";

export const successResponse = <T>(data: T): SuccessResponse<T> => ({
  success: true,
  data,
});

export const errorResponse = (
  message: string,
  code?: string,
  details?: Record<string, unknown>,
): ErrorResponse => ({
  success: false,
  error: {
    message,
    code,
    details,
  },
});

export const getStatusCode = (code?: string): number => {
  const codeMap: Record<string, number> = {
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    BAD_REQUEST: 400,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
  };
  return codeMap[code || "INTERNAL_SERVER_ERROR"] || 500;
};

export type { ApiResponse };
