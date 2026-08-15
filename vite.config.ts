import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), cloudflare()],
  optimizeDeps: {
    exclude: ["@jsquash/jpeg", "@jsquash/png"],
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src/app"),
      "@shared/utils": path.resolve(rootDir, "./src/utils"),
      "@shared/types": path.resolve(rootDir, "./src/types"),
      "@api-server": path.resolve(rootDir, "./src/api-server"),
    },
  },
});
