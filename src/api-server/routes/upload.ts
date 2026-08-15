import { Hono } from "hono";
import type { Env } from "@shared/types/index";
import { handleUpload } from "@api-server/uploadHandler";

export const uploadRouter = new Hono<{ Bindings: Env }>();

uploadRouter.post("/upload", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return c.json({ error: "No file uploaded." }, 400);
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const result = await handleUpload({
    name: file.name,
    type: file.type,
    size: file.size,
    buffer,
  });

  return c.json(result.body, result.status as 200 | 400 | 415 | 422);
});
