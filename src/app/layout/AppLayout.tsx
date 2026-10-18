import type { ReactNode } from "react";
import { GitHubFooter } from "@/components/GitHubFooter";
import { SiteFooter } from "@/components/SiteFooter";
import { AppHeader } from "@/layout/AppHeader";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-dvh flex-col bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl min-h-0 flex-1 overflow-auto px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
      <SiteFooter />
      <GitHubFooter />
    </div>
  );
}
