import { Hono } from "hono";
import type { Env } from "@shared/types/index";
import { errorResponse, successResponse } from "@shared/utils/response";

function generateSessionId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 12);
}

function roomStub(env: Env, sessionId: string) {
  const id = env.SESSION_ROOM.idFromName(sessionId);
  return env.SESSION_ROOM.get(id);
}

export const sessionsRouter = new Hono<{ Bindings: Env }>();

sessionsRouter.post("/sessions", async (c) => {
  const sessionId = generateSessionId();
  const stub = roomStub(c.env, sessionId);

  await stub.fetch(new Request("https://session-room/init", { method: "POST" }));

  return c.json(
    successResponse({
      id: sessionId,
      joinPath: `/s/${sessionId}`,
    }),
  );
});

sessionsRouter.get("/sessions/:id", async (c) => {
  const sessionId = c.req.param("id");
  const stub = roomStub(c.env, sessionId);
  const response = await stub.fetch(new Request("https://session-room/status"));

  if (!response.ok) {
    return c.json(errorResponse("Session not found", "NOT_FOUND"), 404);
  }

  const status = (await response.json()) as {
    participantCount: number;
    alive: boolean;
  };

  return c.json(
    successResponse({
      id: sessionId,
      participantCount: status.participantCount,
      alive: status.alive,
    }),
  );
});

sessionsRouter.get("/sessions/:id/ws", async (c) => {
  const sessionId = c.req.param("id");
  const stub = roomStub(c.env, sessionId);
  return stub.fetch(c.req.raw);
});
