import { Hono } from "hono";
import type { Env } from "@shared/types/index";
import { resolveEnvironment } from "@shared/utils/environment";

export const healthRouter = new Hono<{ Bindings: Env }>();

healthRouter.get("/", (c) => {
  return c.json({
    success: true,
    data: {
      status: "healthy",
      environment: resolveEnvironment(c.env.ENVIRONMENT),
      timestamp: new Date().toISOString(),
    },
  });
});
