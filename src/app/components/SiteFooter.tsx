import {
  APP_NAME,
  GITHUB_ISSUES_URL,
  GITHUB_LICENSE_URL,
  GITHUB_ORG_URL,
  GITHUB_OWNER,
  GITHUB_PROFILE_URL,
  GITHUB_REPO_URL,
} from "@shared/utils/site";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

type FooterLink = { href: string; label: string; external?: boolean };

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-medium tracking-wide text-foreground/80">{title}</p>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="site-footer-link"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer shrink-0 border-t border-border/60 bg-muted/20">
      <div className="landing-container py-12 md:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <p className="text-sm font-semibold tracking-tight text-foreground">{APP_NAME}</p>
            <p className="max-w-xs text-[11px] leading-relaxed text-muted-foreground">
              Ephemeral live-session file sharing on Cloudflare Workers — no accounts, no
              persistent storage.
            </p>
          </div>

          <FooterColumn
            title="Product"
            links={[{ href: "/", label: "Home" }]}
          />

          <FooterColumn
            title="Legal"
            links={[
              { href: GITHUB_REPO_URL, label: "Repository", external: true },
              { href: GITHUB_LICENSE_URL, label: "MIT License", external: true },
              { href: GITHUB_ISSUES_URL, label: "Report an issue", external: true },
            ]}
          />

          <FooterColumn
            title="Open Source"
            links={[
              { href: GITHUB_ORG_URL, label: "GitHub organization", external: true },
              { href: GITHUB_PROFILE_URL, label: `@${GITHUB_OWNER}`, external: true },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border/50 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Copyright © {year} {APP_NAME}. All rights reserved.
          </p>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <GitHubIcon className="size-3.5" />
            <span>Open source on GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
