import type { Context, Next } from "hono";
import { cors } from "hono/cors";
import type { Env } from "@shared/types/index";
import { errorResponse } from "@shared/utils/response";

export const corsMiddleware = cors({
  origin: (origin, c) => {
    const allowed =
      c.env.ALLOWED_ORIGINS?.split(",").map((value: string) => value.trim()) ??
      [];
    if (allowed.length === 0) {
      return origin || "*";
    }
    if (!origin) {
      return allowed[0];
    }
    return allowed.includes(origin) ? origin : allowed[0];
  },
  allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
});

export const errorHandler = async (c: Context<{ Bindings: Env }>, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.error("Error:", error);

    if (error instanceof Error) {
      return c.json(
        errorResponse(
          error.message || "Internal server error",
          "INTERNAL_SERVER_ERROR",
        ),
        500,
      );
    }

    return c.json(
      errorResponse("An unexpected error occurred", "INTERNAL_SERVER_ERROR"),
      500,
    );
  }
};
