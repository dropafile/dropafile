import { Hono } from "hono";
import { logger } from "hono/logger";
import { corsMiddleware, errorHandler } from "@api-server/middleware";
import { healthRouter } from "@api-server/routes/health";
import { sessionsRouter } from "@api-server/routes/sessions";
import { uploadRouter } from "@api-server/routes/upload";
import type { Env } from "@shared/types/index";
import { errorResponse } from "@shared/utils/response";

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());
app.use("*", corsMiddleware);
app.use("*", errorHandler);

app.route("/health", healthRouter);
app.route("/api", sessionsRouter);
app.route("/api", uploadRouter);

app.notFound((c) => {
  return c.json(errorResponse("Not Found", "NOT_FOUND"), 404);
});

export default app;
export { SessionRoom } from "@api-server/session-room";
