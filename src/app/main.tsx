import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { App } from "@/App";
import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system">
      <App />
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  </StrictMode>,
);
