import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { App } from "@/App";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/contexts/session-context";
import "@/styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system">
      <SessionProvider>
        <App />
        <Toaster position="top-right" richColors />
      </SessionProvider>
    </ThemeProvider>
  </StrictMode>,
);
